import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";

import type { PapelDoApp } from "../../../comum/tipos/papel";
import { TipoEventoChat } from "../tipos/chat.enums";
import type { Chat, ConversasResponse, Mensagem } from "../tipos/chat.types";
import { abrirChat, enviarMensagem, listarConversas, marcarLidas } from "./chat.api";

type PaginasChat = InfiniteData<Chat, string | undefined>;
type PaginasConversas = InfiniteData<ConversasResponse, number>;

export const chavesChat = {
  // Por candidatura: é por ela que o chat é aberto (a rota não conhece o id do chat).
  chat: (candidaturaId: string) => ["chat", "candidatura", candidaturaId] as const,
  // Por papel: a API lista pelo papel ativo do token, então cada papel tem a
  // sua lista e trocar de papel consulta de novo em vez de mostrar a do outro.
  conversas: (papel: PapelDoApp) => ["chat", "conversas", papel] as const,
};

/** Tela 42/42b "Conversas": "Listar conversas", 20 por página. */
export function useConversasQuery(papel: PapelDoApp) {
  return useInfiniteQuery({
    queryKey: chavesChat.conversas(papel),
    queryFn: ({ pageParam }) => listarConversas(pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima: ConversasResponse) =>
      ultima.conversas.pagina + 1 < ultima.conversas.totalPaginas
        ? ultima.conversas.pagina + 1
        : undefined,
    // Mensagem chega a qualquer momento: ao abrir a aba, consulta de novo.
    staleTime: 0,
  });
}

/**
 * Consulta a lista de novo ao voltar pra aba. Antes, deixa só a primeira
 * página no cache: o `refetch` de uma consulta infinita buscaria de novo, uma
 * por vez, todas as páginas já roladas, e a ordem (pela última mensagem) muda
 * entre uma consulta e outra.
 */
export function useConsultarConversasDeNovo(papel: PapelDoApp) {
  const queryClient = useQueryClient();
  return useCallback(() => {
    const chave = chavesChat.conversas(papel);
    queryClient.setQueryData<PaginasConversas>(chave, (dados) =>
      dados && dados.pages.length > 1
        ? { pages: dados.pages.slice(0, 1), pageParams: dados.pageParams.slice(0, 1) }
        : dados,
    );
    return queryClient.refetchQueries({ queryKey: chave, exact: true });
  }, [queryClient, papel]);
}

/**
 * Chat da candidatura com o histórico paginado. A primeira página traz as
 * mensagens mais recentes; as seguintes, as anteriores à mais antiga já
 * carregada (`antesDe`). O cabeçalho vale o da primeira página.
 */
export function useChatQuery(candidaturaId: string) {
  return useInfiniteQuery({
    queryKey: chavesChat.chat(candidaturaId),
    queryFn: ({ pageParam }) => abrirChat(candidaturaId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (ultima) =>
      ultima.historico.temMais ? ultima.historico.mensagens.at(-1)?.id : undefined,
    // O canal em tempo real mantém a conversa atualizada; a nova consulta vem
    // ao reconectar, não a cada foco.
    staleTime: Infinity,
  });
}

export function useEnviarMensagemMutation(chatId: string | undefined) {
  return useMutation({
    mutationFn: (texto: string) => {
      if (!chatId) {
        throw new Error("Chat ainda não carregado.");
      }
      return enviarMensagem(chatId, texto);
    },
  });
}

export function useMarcarLidasMutation() {
  return useMutation({ mutationFn: marcarLidas });
}

/**
 * Põe uma mensagem no fim da conversa (início da primeira página), sem
 * repetir: a mesma mensagem pode chegar pela resposta do envio e pela nova
 * consulta depois de reconectar.
 */
export function inserirMensagemNoCache(
  queryClient: QueryClient,
  candidaturaId: string,
  mensagem: Mensagem,
): void {
  queryClient.setQueryData<PaginasChat>(chavesChat.chat(candidaturaId), (atual) => {
    if (!atual || atual.pages.length === 0) {
      return atual;
    }
    const jaTem = atual.pages.some((pagina) =>
      pagina.historico.mensagens.some((m) => m.id === mensagem.id),
    );
    if (jaTem) {
      return atual;
    }
    const [primeira, ...resto] = atual.pages;
    return {
      ...atual,
      pages: [
        {
          ...primeira,
          historico: {
            ...primeira.historico,
            mensagens: [mensagem, ...primeira.historico.mensagens],
          },
        },
        ...resto,
      ],
    };
  });
}

/**
 * Aplica um `ENTREGUE` ou `LIDA` do canal às minhas mensagens. `LIDA` também
 * preenche `entregueEm` (a API manda só o `LIDA` quando a conversa é aberta
 * antes da entrega).
 */
export function confirmarMensagensNoCache(
  queryClient: QueryClient,
  candidaturaId: string,
  tipo: typeof TipoEventoChat.ENTREGUE | typeof TipoEventoChat.LIDA,
  mensagemIds: readonly string[],
  em: string,
): void {
  const ids = new Set(mensagemIds);
  queryClient.setQueryData<PaginasChat>(chavesChat.chat(candidaturaId), (atual) =>
    atual
      ? {
          ...atual,
          pages: atual.pages.map((pagina) => ({
            ...pagina,
            historico: {
              ...pagina.historico,
              mensagens: pagina.historico.mensagens.map((m) => {
                if (!ids.has(m.id)) {
                  return m;
                }
                return tipo === TipoEventoChat.LIDA
                  ? { ...m, entregueEm: m.entregueEm ?? em, lidaEm: m.lidaEm ?? em }
                  : { ...m, entregueEm: m.entregueEm ?? em };
              }),
            },
          })),
        }
      : atual,
  );
}
