import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import {
  dataCurtaHistorico,
  diaDigitado,
  intervaloDoAtalho,
  textoPeriodo,
} from "../servico/anuncio.helpers";
import { useHistoricoQuery } from "../servico/anuncio.queries";
import {
  OPCOES_PERIODO_HISTORICO,
  OPCOES_STATUS_HISTORICO,
  PeriodoHistorico,
  StatusHistorico,
  rotuloAbaHistorico,
  rotuloPeriodoHistorico,
} from "../tipos/anuncio.enums";
import {
  PeriodoPersonalizadoFormSchema,
  type ItemHistorico,
  type PeriodoPersonalizadoFormEntrada,
} from "../tipos/anuncio.types";

export interface ItemHistoricoExibido {
  anuncioId: string;
  titulo: string;
  /** "28/08 · Rafael Souza"; "26/07 · —" sem ninguém escolhido. */
  detalhe: string;
  estado: Estado;
  /** Estrelas da nota recebida (1 a 5); `null` sem nota. */
  nota: number | null;
  /** Link "Avaliar" (tela 45): quem decide é a API (janela de 7 dias). */
  podeAvaliar: boolean;
}

export interface AbaHistoricoExibida {
  valor: StatusHistorico;
  rotulo: string;
  selecionada: boolean;
}

export interface VazioHistorico {
  titulo: string;
  texto: string;
}

export interface OpcaoPeriodoExibida {
  valor: PeriodoHistorico;
  rotulo: string;
  selecionada: boolean;
}

export interface FolhaPeriodoExibida {
  aberta: boolean;
  opcoes: OpcaoPeriodoExibida[];
  /** Campos de data só no "Personalizado". */
  personalizado: boolean;
  dataInicio: string;
  dataFim: string;
  erros: Partial<Record<keyof PeriodoPersonalizadoFormEntrada, string>>;
}

/** Período em uso na consulta: o atalho escolhido e os dias (`yyyy-MM-dd`). */
interface PeriodoAplicado {
  tipo: PeriodoHistorico;
  dataInicio: string;
  dataFim: string;
}

const SEM_OUTRA_PARTE = "—";

const VAZIOS: Record<StatusHistorico, VazioHistorico> = {
  [StatusHistorico.CONCLUIDO]: {
    titulo: "Nenhum serviço concluído",
    texto: "Não há serviços concluídos neste período. Troque o período para ver os mais antigos.",
  },
  [StatusHistorico.CANCELADO]: {
    titulo: "Nenhum anúncio cancelado",
    texto: "Não há anúncios ou serviços cancelados neste período.",
  },
  [StatusHistorico.EXPIRADO]: {
    titulo: "Nenhum anúncio expirado",
    texto: "Não há anúncios que expiraram sem candidatos neste período.",
  },
};

const ESTADO_DO_STATUS: Record<StatusHistorico, Estado> = {
  [StatusHistorico.CONCLUIDO]: "concluido",
  [StatusHistorico.CANCELADO]: "cancelado",
  [StatusHistorico.EXPIRADO]: "expirado",
};

/** "7 serviços concluídos", "1 anúncio expirado". */
function textoTotal(status: StatusHistorico, total: number): string {
  const um = total === 1;
  switch (status) {
    case StatusHistorico.CONCLUIDO:
      return `${total} ${um ? "serviço concluído" : "serviços concluídos"}`;
    case StatusHistorico.CANCELADO:
      return `${total} ${um ? "anúncio cancelado" : "anúncios cancelados"}`;
    case StatusHistorico.EXPIRADO:
      return `${total} ${um ? "anúncio expirado" : "anúncios expirados"}`;
  }
}

function periodoDoAtalho(
  tipo: Exclude<PeriodoHistorico, typeof PeriodoHistorico.PERSONALIZADO>,
): PeriodoAplicado {
  return { tipo, ...intervaloDoAtalho(tipo) };
}

function itemParaExibicao(item: ItemHistorico): ItemHistoricoExibido {
  const partes = [
    item.data ? dataCurtaHistorico(item.data) : null,
    item.outraParte ?? SEM_OUTRA_PARTE,
  ].filter((parte): parte is string => parte !== null);
  return {
    anuncioId: item.anuncioId,
    titulo: item.titulo,
    detalhe: partes.join(" · "),
    estado: ESTADO_DO_STATUS[item.status],
    nota: item.avaliacao?.notaRecebida ?? null,
    podeAvaliar: item.avaliacao?.podeAvaliar ?? false,
  };
}

/**
 * Tela 44 "Histórico" do Empregador (ETI-72): abas Concluídos, Cancelados e
 * Expirados, período (padrão: últimos 3 meses) e "Avaliar" (tela 45). Trocar
 * aba ou período consulta de novo; rolar até o fim pede a próxima página.
 */
export function useHistoricoViewModel() {
  const router = useRouter();
  const [aba, setAba] = useState<StatusHistorico>(StatusHistorico.CONCLUIDO);
  const [periodo, setPeriodo] = useState<PeriodoAplicado>(() =>
    periodoDoAtalho(PeriodoHistorico.TRES_MESES),
  );
  const query = useHistoricoQuery({
    status: aba,
    dataInicio: periodo.dataInicio,
    dataFim: periodo.dataFim,
  });

  // Folha do período: rascunho próprio, só vale ao tocar "Aplicar".
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [tipoRascunho, setTipoRascunho] = useState<PeriodoHistorico>(periodo.tipo);
  const [inicioRascunho, setInicioRascunho] = useState("");
  const [fimRascunho, setFimRascunho] = useState("");
  const [errosFolha, setErrosFolha] = useState<FolhaPeriodoExibida["erros"]>({});

  // Só o gesto de puxar (ou "Tentar de novo") gira a rodinha: `isRefetching`
  // também vale nas recargas em segundo plano (foco, voltar da avaliação).
  const [puxando, setPuxando] = useState(false);

  // A aba da barra continua montada: ao voltar pra ela (da tela 45, do
  // Início), consulta de novo, porque "Avaliar" e a nota mudam fora da tela.
  // O primeiro foco é pulado porque o mount já consultou.
  // Os atalhos ("Últimos 3 meses") são relativos a hoje: o intervalo é
  // recalculado a cada foco, senão depois da meia-noite a consulta para em
  // "ontem". Mesmo dia devolve o mesmo estado (sem render nem consulta extra).
  const { refetch } = query;
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      setPeriodo((atual) => {
        if (atual.tipo === PeriodoHistorico.PERSONALIZADO) {
          return atual;
        }
        const hoje = periodoDoAtalho(atual.tipo);
        return hoje.dataInicio === atual.dataInicio && hoje.dataFim === atual.dataFim
          ? atual
          : hoje;
      });
      void refetch();
    }, [refetch]),
  );

  const itens = (query.data?.pages ?? [])
    .flatMap((pagina) => pagina.content)
    .map(itemParaExibicao);

  const total = query.data?.pages[0]?.totalElementos ?? null;

  const erro =
    query.isError && !query.data
      ? mensagemErroApi(query.error, "Não foi possível carregar seu histórico.")
      : null;

  function abrirFolha() {
    setTipoRascunho(periodo.tipo);
    setInicioRascunho(diaDigitado(periodo.dataInicio));
    setFimRascunho(diaDigitado(periodo.dataFim));
    setErrosFolha({});
    setFolhaAberta(true);
  }

  function aplicarPeriodo() {
    if (tipoRascunho !== PeriodoHistorico.PERSONALIZADO) {
      setPeriodo(periodoDoAtalho(tipoRascunho));
      setFolhaAberta(false);
      return;
    }
    const resultado = PeriodoPersonalizadoFormSchema.safeParse({
      dataInicio: inicioRascunho,
      dataFim: fimRascunho,
    });
    if (!resultado.success) {
      const erros: FolhaPeriodoExibida["erros"] = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] as keyof PeriodoPersonalizadoFormEntrada;
        erros[campo] ??= problema.message;
      }
      setErrosFolha(erros);
      return;
    }
    setPeriodo({ tipo: PeriodoHistorico.PERSONALIZADO, ...resultado.data });
    setFolhaAberta(false);
  }

  const abas: AbaHistoricoExibida[] = OPCOES_STATUS_HISTORICO.map((valor) => ({
    valor,
    rotulo: rotuloAbaHistorico(valor),
    selecionada: valor === aba,
  }));

  const folha: FolhaPeriodoExibida = {
    aberta: folhaAberta,
    opcoes: OPCOES_PERIODO_HISTORICO.map((valor) => ({
      valor,
      rotulo: rotuloPeriodoHistorico(valor),
      selecionada: valor === tipoRascunho,
    })),
    personalizado: tipoRascunho === PeriodoHistorico.PERSONALIZADO,
    dataInicio: inicioRascunho,
    dataFim: fimRascunho,
    erros: errosFolha,
  };

  return {
    abas,
    itens,
    periodo: textoPeriodo(periodo.dataInicio, periodo.dataFim),
    /** "7 serviços concluídos"; `null` enquanto carrega ou com erro. */
    resumo: total === null ? null : textoTotal(aba, total),
    /** "Últimos 3 meses" ou "Personalizado". */
    rotuloPeriodo: rotuloPeriodoHistorico(periodo.tipo),
    carregando: query.isPending,
    erro,
    // Pelo dado, não pelo `isSuccess`: recarga que falha mantém o cache (vazio ou não) na tela.
    vazio: query.data && itens.length === 0 ? VAZIOS[aba] : null,
    carregandoMais: query.isFetchingNextPage,
    atualizando: puxando,
    folha,
    aoVoltar: () => router.navigate("/(app)/(contratante)"),
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
    aoAvaliar: (anuncioId: string) =>
      router.push({ pathname: "/(app)/avaliacao/[anuncioId]", params: { anuncioId } }),
    aoTrocarPeriodo: abrirFolha,
    aoEscolherPeriodo: (valor: PeriodoHistorico) => {
      setTipoRascunho(valor);
      setErrosFolha({});
    },
    aoMudarDataInicio: (texto: string) => {
      setInicioRascunho(texto);
      setErrosFolha((erros) => ({ ...erros, dataInicio: undefined }));
    },
    aoMudarDataFim: (texto: string) => {
      setFimRascunho(texto);
      setErrosFolha((erros) => ({ ...erros, dataFim: undefined }));
    },
    aoAplicarPeriodo: aplicarPeriodo,
    aoFecharFolha: () => setFolhaAberta(false),
  };
}

export type HistoricoViewModel = ReturnType<typeof useHistoricoViewModel>;
