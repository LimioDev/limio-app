import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { primeiroNome } from "../servico/anuncio.helpers";
import { useCandidatosQuery, useEscolherPrestadorMutation } from "../servico/anuncio.queries";
import { EtapaEscolha } from "../tipos/anuncio.enums";
import type { Candidato } from "../tipos/anuncio.types";

/**
 * Escolhas do mês do plano FREE. Tem que acompanhar o `perfil.cota.teto-free`
 * do back (configurável, padrão 4): a lista de candidatos não traz o teto, então
 * os textos das telas 23 e 24 usam este valor. Se o teto mudar lá, mudar aqui.
 */
const ESCOLHAS_DO_MES_FREE = 4;

const NAO_DISPONIVEL = "Este candidato não está mais disponível";

const formatoNota = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface CandidatoEscolhaExibido {
  /** "Rafael S.", no título. */
  nome: string;
  fotoUrl: string | null;
  cacheKey: string;
  /** "Elétrica · 4,8 · 23 avaliações". */
  resumo: string;
}

/** Tela 23: o que acontece ao confirmar. `null` some da lista. */
export interface ConsequenciasExibidas {
  contato: string;
  outros: string | null;
  mural: string;
  /** Só pra candidato FREE: GOLD não consome cota. */
  cota: string | null;
}

/** Tela 24: a escolha foi recusada pela cota do candidato. */
export interface CotaEsgotadaExibida {
  texto: string;
  outros: string;
}

function resumoDoCandidato(candidato: Candidato): string {
  const partes = [...candidato.especialidades];
  if (candidato.mediaAvaliacoes !== null && candidato.qtdAvaliacoes > 0) {
    partes.push(formatoNota.format(candidato.mediaAvaliacoes));
    partes.push(
      candidato.qtdAvaliacoes === 1 ? "1 avaliação" : `${candidato.qtdAvaliacoes} avaliações`,
    );
  } else {
    partes.push("Sem avaliações ainda");
  }
  return partes.join(" · ");
}

function outrosEncerrados(total: number): string | null {
  if (total === 0) {
    return null;
  }
  return total === 1
    ? "O outro candidato é encerrado e o chat fica só leitura."
    : `Os outros ${total} candidatos são encerrados e os chats ficam só leitura.`;
}

function outrosDisponiveis(total: number): string {
  if (total === 0) {
    return "Não há outros candidatos por enquanto.";
  }
  return total === 1
    ? "O outro candidato continua disponível."
    : `Os outros ${total} candidatos continuam disponíveis.`;
}

/**
 * Telas 23 "Escolher (nome)?" e 24 "Não foi possível escolher (nome)", folhas
 * de baixo por cima da tela 18 ou do chat (tela 21). Os dados do candidato
 * vêm da lista de candidatos (já em cache por quem abriu a folha).
 *
 * O sucesso deveria abrir a tela 25 "Serviço combinado", que chega com o
 * ETI-87; até lá, abre a tela 16, que mostra o anúncio como "Combinado".
 */
export function useEscolherPrestadorViewModel(anuncioId: string, candidaturaId: string) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useCandidatosQuery(anuncioId);
  const escolher = useEscolherPrestadorMutation(anuncioId);
  const [etapa, setEtapa] = useState<EtapaEscolha>(EtapaEscolha.CONFIRMAR);
  const [erro, setErro] = useState<string | null>(null);

  // O candidato fica guardado: depois da chamada a lista é consultada de novo
  // e ele pode sair dela, mas o nome continua na folha até ela fechar.
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const daLista = query.data?.candidatos.find((c) => c.candidaturaId === candidaturaId);
  if (daLista && daLista !== candidato && etapa === EtapaEscolha.CONFIRMAR && !escolher.isPending) {
    setCandidato(daLista);
  }

  // Depois de mandar a escolha, a folha só fecha pelo resultado dela.
  const encerrada = useRef(false);

  // Trava síncrona do "Confirmar escolha": `isPending` e o `disabled` do botão
  // só mudam no próximo render, e um clique duplo chega antes dele. Sem ela
  // saem 2 chamadas, a segunda volta `ESCOLHA_CONFLITO` e, como só rodam os
  // callbacks do último `mutate`, o Empregador veria erro numa escolha que deu certo.
  const enviandoRef = useRef(false);

  const fechar = useCallback(() => {
    encerrada.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/(app)/anuncio/[id]/candidatos", params: { id: anuncioId } });
    }
  }, [router, anuncioId]);

  // Tela 25 (ETI-87) ainda não existe: a tela 16 mostra o anúncio "Combinado".
  function abrirServicoCombinado() {
    encerrada.current = true;
    router.dismissTo({ pathname: "/(app)/anuncio/[id]", params: { id: anuncioId } });
  }

  // Aberta com a lista já sem o candidato (desistiu ou foi recusado em outro
  // aparelho), ou sem conseguir carregá-la: não há o que confirmar.
  // Só antes de mandar a escolha: depois dela a lista muda de propósito.
  let semCandidato: string | null = null;
  if (etapa === EtapaEscolha.CONFIRMAR && escolher.isIdle) {
    if (query.isError && !query.data) {
      semCandidato = mensagemErroApi(query.error, "Não foi possível carregar o candidato.");
    } else if (query.data && !daLista) {
      semCandidato = NAO_DISPONIVEL;
    }
  }
  useEffect(() => {
    if (semCandidato && !encerrada.current) {
      mostrarToast(semCandidato, TipoToast.ERRO);
      fechar();
    }
  }, [semCandidato, mostrarToast, fechar]);

  function confirmar() {
    if (!candidato || enviandoRef.current) {
      return;
    }
    enviandoRef.current = true;
    setErro(null);
    escolher.mutate(candidato.candidaturaId, {
      onSettled: () => {
        enviandoRef.current = false;
      },
      onSuccess: () => {
        mostrarToast(`Serviço combinado com ${candidato.nome}`);
        abrirServicoCombinado();
      },
      onError: (falha) => {
        switch (erroApi(falha)?.codigo) {
          // Tela 24: nada mudou no anúncio; a lista já está sendo recarregada.
          case CodigoErro.COTA_ESGOTADA_CANDIDATO:
            setEtapa(EtapaEscolha.COTA_ESGOTADA);
            return;
          // Outro aparelho escolheu antes, ou o anúncio saiu de `PUBLICADO`.
          case CodigoErro.ESCOLHA_CONFLITO:
          case CodigoErro.ANUNCIO_ESTADO_INVALIDO:
            mostrarToast("Este anúncio já foi combinado", TipoToast.ERRO);
            abrirServicoCombinado();
            return;
          // O candidato desistiu ou foi recusado enquanto a folha estava aberta.
          case CodigoErro.CANDIDATURA_ESTADO_INVALIDO:
          case CodigoErro.CANDIDATURA_NAO_ENCONTRADA:
            mostrarToast(NAO_DISPONIVEL, TipoToast.ERRO);
            fechar();
            return;
          case CodigoErro.ANUNCIO_NAO_ENCONTRADO:
            mostrarToast("Este anúncio não existe ou não é seu.", TipoToast.ERRO);
            router.dismissTo("/(app)/(contratante)");
            return;
          // Rede ou erro inesperado: a folha fica aberta pra tentar de novo.
          default:
            setErro(mensagemErroApi(falha, "Não foi possível escolher o candidato. Tente de novo."));
        }
      },
    });
  }

  const outros =
    query.data?.candidatos.filter((c) => c.candidaturaId !== candidaturaId).length ?? 0;
  const nome = candidato ? primeiroNome(candidato.nome) : "";

  const exibido: CandidatoEscolhaExibido | null = candidato
    ? {
        nome: candidato.nome,
        fotoUrl: candidato.fotoUrl,
        cacheKey: `candidato-${candidato.candidaturaId}`,
        resumo: resumoDoCandidato(candidato),
      }
    : null;

  const consequencias: ConsequenciasExibidas = {
    contato: `${nome} recebe seu telefone e o endereço completo do serviço.`,
    outros: outrosEncerrados(outros),
    mural: "O anúncio sai do mural e passa para Combinado.",
    cota:
      candidato && !candidato.gold
        ? `Consome 1 das ${ESCOLHAS_DO_MES_FREE} escolhas do mês de ${nome} (plano FREE).`
        : null,
  };

  const cotaEsgotada: CotaEsgotadaExibida = {
    // O card diz "ela foi escolhida"; o app não sabe o gênero, então o texto é neutro.
    texto: `Entre a candidatura e agora, ${nome} bateu as ${ESCOLHAS_DO_MES_FREE} escolhas do plano FREE neste mês, em outros serviços.`,
    outros: outrosDisponiveis(outros),
  };

  const enviando = escolher.isPending;

  return {
    etapa,
    candidato: exibido,
    consequencias,
    cotaEsgotada,
    enviando,
    erro,
    aoConfirmar: confirmar,
    // Durante a chamada a folha não fecha: o resultado ainda vai mudar a tela.
    aoFechar: () => {
      if (!enviando) {
        fechar();
      }
    },
    // Tela 24: volta pra tela 18 (fechando o chat, se a escolha partiu dele),
    // com a lista recarregada pela mutation.
    aoEscolherOutro: () => {
      encerrada.current = true;
      router.dismissTo({ pathname: "/(app)/anuncio/[id]/candidatos", params: { id: anuncioId } });
    },
  };
}

export type EscolherPrestadorViewModel = ReturnType<typeof useEscolherPrestadorViewModel>;
