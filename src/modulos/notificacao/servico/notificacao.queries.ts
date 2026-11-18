import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import type { NotificacoesResponse } from "../tipos/notificacao.types";
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
} from "./notificacao.api";

export const chavesNotificacao = {
  lista: ["notificacao", "lista"] as const,
};

type PaginasNotificacoes = InfiniteData<NotificacoesResponse, number>;

// Lista (tela 43) e sino (tela 13) leem a mesma consulta: a primeira página já
// traz o total de não lidas, então o sino não pede nada a mais.
const opcoesLista = {
  queryKey: chavesNotificacao.lista,
  queryFn: ({ pageParam }: { pageParam: number }) => listarNotificacoes(pageParam),
  initialPageParam: 0,
  getNextPageParam: (ultima: NotificacoesResponse) =>
    ultima.notificacoes.pagina + 1 < ultima.notificacoes.totalPaginas
      ? ultima.notificacoes.pagina + 1
      : undefined,
  // Notificação chega a qualquer momento; ao abrir a tela, consulta de novo.
  staleTime: 0,
};

/** Tela 43 "Notificações": "Listar notificações" ao abrir, 20 por página. */
export function useNotificacoesQuery() {
  return useInfiniteQuery(opcoesLista);
}

/** Sino da tela 13: só o total de não lidas. */
export function useNaoLidasQuery() {
  return useInfiniteQuery({
    ...opcoesLista,
    select: (dados: PaginasNotificacoes) => dados.pages[0]?.naoLidas ?? 0,
  });
}

/**
 * Sino: consulta de novo o total de não lidas. Antes, deixa só a primeira
 * página no cache: o `refetch` de uma consulta infinita busca de novo todas as
 * páginas que a tela 43 já rolou, uma por vez, só pra ler o `naoLidas` da
 * primeira. Com o Início em foco a tela 43 já saiu da pilha, então ninguém
 * está vendo as outras páginas.
 */
export function useConsultarNaoLidasDeNovo() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.setQueryData<PaginasNotificacoes>(chavesNotificacao.lista, (dados) =>
      dados && dados.pages.length > 1
        ? { pages: dados.pages.slice(0, 1), pageParams: dados.pageParams.slice(0, 1) }
        : dados,
    );
    return queryClient.refetchQueries({ queryKey: chavesNotificacao.lista, exact: true });
  }, [queryClient]);
}

/**
 * Marca como lidas no cache (`ids` nulo = todas) e põe o total que a API
 * devolveu, pra lista e sino mudarem sem listar de novo.
 */
function aplicarLeitura(
  queryClient: QueryClient,
  ids: ReadonlySet<string> | null,
  naoLidas: number,
) {
  const agora = new Date().toISOString();
  queryClient.setQueryData<PaginasNotificacoes>(chavesNotificacao.lista, (dados) =>
    dados
      ? {
          ...dados,
          pages: dados.pages.map((pagina) => ({
            naoLidas,
            notificacoes: {
              ...pagina.notificacoes,
              content: pagina.notificacoes.content.map((n) =>
                n.lidaEm === null && (ids === null || ids.has(n.id))
                  ? { ...n, lidaEm: agora }
                  : n,
              ),
            },
          })),
        }
      : dados,
  );
}

/** Tocar num item: "Marcar como lida". */
export function useMarcarComoLidaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marcarNotificacaoComoLida,
    onSuccess: ({ naoLidas }, notificacaoId) =>
      aplicarLeitura(queryClient, new Set([notificacaoId]), naoLidas),
  });
}

/** Link "Marcar lidas": "Marcar todas como lidas". */
export function useMarcarTodasComoLidasMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marcarTodasNotificacoesComoLidas,
    onSuccess: ({ naoLidas }) => aplicarLeitura(queryClient, null, naoLidas),
  });
}

/** Push chegou com o app aberto: lista e sino consultam de novo. */
export function useAtualizarNotificacoes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: chavesNotificacao.lista });
}
