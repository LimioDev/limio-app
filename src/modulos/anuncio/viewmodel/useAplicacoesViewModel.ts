import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { quandoCurto } from "../servico/anuncio.helpers";
import {
  useDesistirCandidaturaMutation,
  useMinhasCandidaturasQuery,
} from "../servico/anuncio.queries";
import {
  AbaCandidatura,
  OPCOES_ABA_CANDIDATURA,
  StatusAplicacao,
  rotuloAbaCandidatura,
} from "../tipos/anuncio.enums";
import type { MinhaCandidatura } from "../tipos/anuncio.types";

/** O que o link à direita do cartão faz; `null` quando não há link. */
export type AcaoCandidatura = "cancelar" | "detalhes" | null;

export interface CandidaturaExibida {
  id: string;
  anuncioId: string;
  estado: Estado;
  /** "Aguardando escolha", "Combinado"... */
  selo: string;
  /** "Qua, 03/09 · 14h". */
  quando: string;
  titulo: string;
  /** "Marina B."; "Conta encerrada" sem o Empregador. */
  nomeEmpregador: string;
  /** "MB"; "?" sem o Empregador. */
  iniciaisEmpregador: string;
  acao: AcaoCandidatura;
}

export interface AbaExibida {
  valor: AbaCandidatura;
  rotulo: string;
  selecionada: boolean;
}

export interface VazioAplicacoes {
  titulo: string;
  texto: string;
  /** Só "Pendentes" leva ao Mural (tela 32e). */
  irParaMural: boolean;
}

export interface FolhaDesistirExibida {
  aberta: boolean;
  /** "Instalar 3 tomadas e trocar disjuntor · Marina B.". */
  resumo: string;
  /** Primeiro nome do Empregador, usado nos itens da folha. */
  empregador: string;
  /** Chamada em andamento: botões travados e a folha não fecha. */
  enviando: boolean;
  erro: string | null;
}

const EMPREGADOR_SEM_CONTA = "Conta encerrada";

const VAZIOS: Record<AbaCandidatura, VazioAplicacoes> = {
  [AbaCandidatura.PENDENTES]: {
    titulo: "Nenhuma candidatura pendente",
    texto: "Candidate-se a serviços no Mural. Elas aparecem aqui até o Empregador escolher.",
    irParaMural: true,
  },
  [AbaCandidatura.COMBINADAS]: {
    titulo: "Nenhum serviço combinado",
    texto: "Quando um Empregador escolher sua candidatura, o serviço aparece aqui.",
    irParaMural: false,
  },
  [AbaCandidatura.HISTORICO]: {
    titulo: "Seu histórico está vazio",
    texto: "Serviços concluídos ou cancelados e candidaturas encerradas aparecem aqui.",
    irParaMural: false,
  },
};

/** Selo de cada status. RECUSADA e ENCERRADA não estão no protótipo (decisão de 09/11). */
function seloDoStatus(status: StatusAplicacao): { estado: Estado; rotulo: string } {
  switch (status) {
    case StatusAplicacao.ENVIADA:
      return { estado: "aguardando", rotulo: "Aguardando escolha" };
    case StatusAplicacao.ESCOLHIDA:
      return { estado: "combinado", rotulo: "Combinado" };
    case StatusAplicacao.AGUARDANDO_VALIDACAO:
      return { estado: "validacao", rotulo: "Aguardando validação" };
    case StatusAplicacao.CONCLUIDA:
      return { estado: "concluido", rotulo: "Concluído" };
    case StatusAplicacao.RECUSADA:
      return { estado: "expirado", rotulo: "Não escolhido" };
    case StatusAplicacao.ENCERRADA:
      // Desistência ou serviço cancelado: o item não diz qual.
      return { estado: "cancelado", rotulo: "Encerrado" };
  }
}

/**
 * "Cancelar" só na pendente. "Ver Detalhes" abre a tela 36, que a API só
 * devolve pra candidatura que chegou a ser escolhida: RECUSADA nunca foi, então
 * fica sem link. ENCERRADA pode ter sido (serviço cancelado) ou não
 * (desistência); o item não traz `escolhidaEm`, então mostra e a tela 36 trata
 * o 404.
 */
function acaoDoStatus(status: StatusAplicacao): AcaoCandidatura {
  switch (status) {
    case StatusAplicacao.ENVIADA:
      return "cancelar";
    case StatusAplicacao.ESCOLHIDA:
    case StatusAplicacao.AGUARDANDO_VALIDACAO:
    case StatusAplicacao.CONCLUIDA:
    case StatusAplicacao.ENCERRADA:
      return "detalhes";
    case StatusAplicacao.RECUSADA:
      return null;
  }
}

function candidaturaParaExibicao(candidatura: MinhaCandidatura): CandidaturaExibida {
  const selo = seloDoStatus(candidatura.status);
  return {
    id: candidatura.id,
    anuncioId: candidatura.anuncioId,
    estado: selo.estado,
    selo: selo.rotulo,
    quando: quandoCurto(candidatura.dataHoraPretendida),
    titulo: candidatura.titulo,
    nomeEmpregador: candidatura.nomeEmpregador ?? EMPREGADOR_SEM_CONTA,
    iniciaisEmpregador: candidatura.iniciaisEmpregador ?? "?",
    acao: acaoDoStatus(candidatura.status),
  };
}

function primeiroNome(nome: string | null): string {
  return nome?.trim().split(/\s+/)[0] || "o Empregador";
}

/**
 * Tela 32 "Aplicações" do Prestador (ETI-78): abas Pendentes, Combinadas e
 * Histórico, com "Cancelar" (desistir, 32d) e "Ver Detalhes" (tela 36). A aba
 * de cada candidatura quem decide é a API.
 */
export function useAplicacoesViewModel() {
  const router = useRouter();
  const [aba, setAba] = useState<AbaCandidatura>(AbaCandidatura.PENDENTES);
  const query = useMinhasCandidaturasQuery(aba);
  const desistir = useDesistirCandidaturaMutation();
  const mostrarToast = useToast((estado) => estado.mostrar);
  // A candidatura fica guardada depois de fechar, pro texto não sumir na animação.
  const [selecionada, setSelecionada] = useState<MinhaCandidatura | null>(null);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [erroFolha, setErroFolha] = useState<string | null>(null);
  // Só o gesto de puxar (ou "Tentar de novo") gira a rodinha: `isRefetching`
  // também vale nas recargas em segundo plano (foco, troca de aba, desistir).
  const [puxando, setPuxando] = useState(false);

  // A aba da barra continua montada: ao voltar pra ela (do Mural, da tela 36),
  // consulta de novo, porque a situação muda fora da tela. O primeiro foco é
  // pulado porque o mount já consultou.
  const { refetch } = query;
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  const candidaturas = (query.data?.pages ?? [])
    .flatMap((pagina) => pagina.content)
    .map(candidaturaParaExibicao);

  const erro =
    query.isError && !query.data
      ? mensagemErroApi(query.error, "Não foi possível carregar suas candidaturas.")
      : null;

  function fecharFolha() {
    setFolhaAberta(false);
    setErroFolha(null);
  }

  function confirmarDesistencia() {
    if (!selecionada || desistir.isPending) {
      return;
    }
    const { id, anuncioId } = selecionada;
    setErroFolha(null);
    desistir.mutate(id, {
      onSuccess: () => {
        fecharFolha();
        mostrarToast("Candidatura cancelada.");
      },
      onError: (falha) => {
        switch (erroApi(falha)?.codigo) {
          // Foi escolhido entre abrir a lista e confirmar: sair agora é cancelar o serviço (ETI-97).
          case CodigoErro.USE_CANCELAMENTO_SERVICO:
            fecharFolha();
            mostrarToast("Você já foi escolhido. Para sair, cancele o serviço.", TipoToast.ERRO);
            router.push({ pathname: "/(app)/servico/[id]", params: { id: anuncioId } });
            return;
          // Já encerrada ou não é mais dele: a mutation já recarrega a lista.
          case CodigoErro.CANDIDATURA_ESTADO_INVALIDO:
          case CodigoErro.CANDIDATURA_NAO_ENCONTRADA:
            fecharFolha();
            mostrarToast("Esta candidatura já foi encerrada.", TipoToast.ERRO);
            return;
          default:
            setErroFolha(mensagemErroApi(falha, "Não foi possível cancelar a candidatura."));
        }
      },
    });
  }

  const abas: AbaExibida[] = OPCOES_ABA_CANDIDATURA.map((valor) => ({
    valor,
    rotulo: rotuloAbaCandidatura(valor),
    selecionada: valor === aba,
  }));

  const folha: FolhaDesistirExibida = {
    aberta: folhaAberta,
    resumo: selecionada
      ? `${selecionada.titulo} · ${selecionada.nomeEmpregador ?? EMPREGADOR_SEM_CONTA}`
      : "",
    empregador: primeiroNome(selecionada?.nomeEmpregador ?? null),
    enviando: desistir.isPending,
    erro: erroFolha,
  };

  return {
    abas,
    candidaturas,
    carregando: query.isPending,
    erro,
    // Pelo dado, não pelo `isSuccess`: recarga que falha mantém o cache (vazio ou não) na tela.
    vazio: query.data && candidaturas.length === 0 ? VAZIOS[aba] : null,
    carregandoMais: query.isFetchingNextPage,
    atualizando: puxando,
    folha,
    aoEscolherAba: setAba,
    aoAtualizar: () => {
      setPuxando(true);
      void refetch().finally(() => setPuxando(false));
    },
    aoFimDaLista: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    aoIrParaMural: () => router.navigate("/(app)/(prestador)"),
    aoCancelar: (id: string) => {
      const candidatura = query.data?.pages
        .flatMap((pagina) => pagina.content)
        .find((item) => item.id === id);
      if (candidatura) {
        setErroFolha(null);
        setSelecionada(candidatura);
        setFolhaAberta(true);
      }
    },
    aoVerDetalhes: (anuncioId: string) =>
      router.push({ pathname: "/(app)/servico/[id]", params: { id: anuncioId } }),
    aoConfirmarDesistencia: confirmarDesistencia,
    aoFecharFolha: fecharFolha,
  };
}

export type AplicacoesViewModel = ReturnType<typeof useAplicacoesViewModel>;
