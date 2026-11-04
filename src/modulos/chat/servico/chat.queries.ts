import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import { obterUsuarioId } from "../../../comum/lib/api";
import { TipoEventoChat } from "../tipos/chat.enums";
import type { Chat, Mensagem } from "../tipos/chat.types";
import { abrirChat, enviarMensagem, marcarLidas } from "./chat.api";

type PaginasChat = InfiniteData<Chat, string | undefined>;

export const chavesChat = {
  // Por candidatura: é por ela que o chat é aberto (a rota não conhece o id do chat).
  chat: (candidaturaId: string) => ["chat", "candidatura", candidaturaId] as const,
  usuarioId: ["chat", "usuario-id"] as const,
};

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

/** Id de quem está logado, para separar os balões. Muda só com outra sessão (o logout limpa o cache). */
export function useUsuarioIdQuery() {
  return useQuery({
    queryKey: chavesChat.usuarioId,
    queryFn: obterUsuarioId,
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
