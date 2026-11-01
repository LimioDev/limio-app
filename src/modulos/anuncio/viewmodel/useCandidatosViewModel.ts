import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { dataComProximidade } from "../servico/anuncio.helpers";
import {
  useAnuncioQuery,
  useCandidatosQuery,
  useRecusarCandidatoMutation,
} from "../servico/anuncio.queries";
import type { Candidato } from "../tipos/anuncio.types";

export interface CandidatoExibido {
  candidaturaId: string;
  nome: string;
  fotoUrl: string | null;
  gold: boolean;
  /** `null` sem avaliação: a tela mostra "Sem avaliações ainda", nunca 0,0. */
  reputacao: { nota: number; totalAvaliacoes: number } | null;
  /** "Elétrica · Montagem"; `null` sem especialidade. */
  especialidades: string | null;
}

/** Tela 19: textos que dependem do anúncio (vêm do detalhe da tela 16). */
export interface CandidatosVazioExibido {
  /** "Pintura"; `null` enquanto o detalhe não carregou. */
  categoria: string | null;
  /** "Rever a data — 02/09 é amanhã". */
  reverData: string;
}

/** Tela 18b: folha "Recusar Rafael S.?". */
export interface FolhaRecusarExibida {
  aberta: boolean;
  /** "Rafael S.", no título. */
  nome: string;
  /** "Rafael", nos textos corridos. */
  primeiroNome: string;
  /** Recusa em andamento: botões travados e a folha não fecha. */
  enviando: boolean;
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

function candidatoParaExibicao(candidato: Candidato): CandidatoExibido {
  return {
    candidaturaId: candidato.candidaturaId,
    nome: candidato.nome,
    fotoUrl: candidato.fotoUrl,
    gold: candidato.gold,
    reputacao:
      candidato.mediaAvaliacoes !== null && candidato.qtdAvaliacoes > 0
        ? { nota: candidato.mediaAvaliacoes, totalAvaliacoes: candidato.qtdAvaliacoes }
        : null,
    especialidades:
      candidato.especialidades.length > 0 ? candidato.especialidades.join(" · ") : null,
  };
}

/**
 * Telas 18 "Candidatos" e 19 "Candidatos vazio", abertas pelo "Ver todos" da
 * tela 16. O título e a categoria vêm do detalhe do anúncio, já em cache.
 * "Escolher" (ETI-69/70), o perfil do candidato (ETI-106) e as dicas que
 * levam a "Editar anúncio" (ETI-61/62) ficam desligados até os cards deles.
 */
export function useCandidatosViewModel(anuncioId: string) {
  const router = useRouter();
  const query = useCandidatosQuery(anuncioId);
  const anuncio = useAnuncioQuery(anuncioId);
  const recusar = useRecusarCandidatoMutation(anuncioId);
  const mostrarToast = useToast((estado) => estado.mostrar);
  // O candidato fica guardado depois de fechar: o nome não some durante a animação.
  const [recusando, setRecusando] = useState<Candidato | null>(null);
  const [folhaAberta, setFolhaAberta] = useState(false);

  // Volta do chat com a lista possivelmente mudada (desistência, novo
  // candidato). O primeiro foco é pulado porque o mount já consultou.
  const primeiroFoco = useRef(true);
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  let erro: string | null = null;
  let podeTentarDeNovo = true;
  if (query.isError && !query.data) {
    podeTentarDeNovo = erroApi(query.error)?.codigo !== CodigoErro.ANUNCIO_NAO_ENCONTRADO;
    erro = podeTentarDeNovo
      ? mensagemErroApi(query.error, "Não foi possível carregar os candidatos.")
      : "Este anúncio não existe ou não é seu.";
  }

  function voltarAoAnuncio() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/(app)/anuncio/[id]", params: { id: anuncioId } });
    }
  }

  function fecharFolha() {
    setFolhaAberta(false);
  }

  function confirmarRecusa() {
    if (!recusando) {
      return;
    }
    recusar.mutate(recusando.candidaturaId, {
      onSuccess: () => {
        fecharFolha();
        mostrarToast("Candidatura recusada");
      },
      onError: (falha) => {
        fecharFolha();
        switch (erroApi(falha)?.codigo) {
          // Outra ação mudou o anúncio (ex.: candidato escolhido em outro aparelho).
          case CodigoErro.ANUNCIO_ESTADO_INVALIDO:
            mostrarToast("Este anúncio já foi combinado", TipoToast.ERRO);
            voltarAoAnuncio();
            return;
          // O candidato desistiu ou já saiu da lista: vale a lista nova.
          case CodigoErro.CANDIDATURA_ESTADO_INVALIDO:
          case CodigoErro.CANDIDATURA_NAO_ENCONTRADA:
            mostrarToast("Este candidato não está mais disponível", TipoToast.ERRO);
            void query.refetch();
            return;
          default:
            mostrarToast(
              mensagemErroApi(falha, "Não foi possível recusar a candidatura."),
              TipoToast.ERRO,
            );
        }
      },
    });
  }

  const candidatos = query.data?.candidatos.map(candidatoParaExibicao) ?? null;

  const vazio: CandidatosVazioExibido = {
    categoria: anuncio.data?.categoria.nome ?? null,
    reverData: anuncio.data
      ? `Rever a data — ${dataComProximidade(anuncio.data.dataHoraPretendida)}`
      : "Rever a data",
  };

  const folha: FolhaRecusarExibida = {
    aberta: folhaAberta,
    nome: recusando?.nome ?? "",
    primeiroNome: recusando ? primeiroNome(recusando.nome) : "",
    enviando: recusar.isPending,
  };

  return {
    tituloAnuncio: anuncio.data?.titulo ?? null,
    carregando: query.isPending,
    erro,
    podeTentarDeNovo,
    aoTentarDeNovo: () => void query.refetch(),
    candidatos,
    vazio,
    atualizando: query.isRefetching,
    aoAtualizar: () => void query.refetch(),
    aoVoltar: voltarAoAnuncio,
    aoRecusar: (candidaturaId: string) => {
      const candidato = query.data?.candidatos.find((c) => c.candidaturaId === candidaturaId);
      if (candidato) {
        setRecusando(candidato);
        setFolhaAberta(true);
      }
    },
    // O chat da tela 21 é aberto pela candidatura, como no lado do Prestador.
    aoConversar: (candidaturaId: string) =>
      router.push({ pathname: "/(app)/chat/[aplicacaoId]", params: { aplicacaoId: candidaturaId } }),
    // Confirmação da tela 23 chega com o ETI-69/70.
    aoEscolher: undefined as ((candidaturaId: string) => void) | undefined,
    // Perfil público (tela 20a) chega com o ETI-106; a API ainda não manda o id do Prestador.
    aoVerPerfil: undefined as ((candidaturaId: string) => void) | undefined,
    // "Editar anúncio" (tela 16a) chega com o ETI-61/62.
    aoEditarAnuncio: undefined as (() => void) | undefined,
    folha,
    aoConfirmarRecusa: confirmarRecusa,
    aoFecharFolha: fecharFolha,
  };
}
