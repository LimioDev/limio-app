import { api } from "../../../comum/lib/api";
import {
  ChatSchema,
  EnviarMensagemRequestSchema,
  MensagemSchema,
  TAMANHO_PAGINA_HISTORICO,
  type Chat,
  type Mensagem,
} from "../tipos/chat.types";

/**
 * `GET /candidaturas/{candidaturaId}/chat` (ETI-101): cabeçalho, somente
 * leitura e uma página do histórico. Sem `antesDe`, as mensagens mais
 * recentes. Abrir não marca nada como entregue ou lido.
 */
export async function abrirChat(candidaturaId: string, antesDe?: string): Promise<Chat> {
  const { data } = await api.get(`/candidaturas/${candidaturaId}/chat`, {
    params: { antesDe, tamanho: TAMANHO_PAGINA_HISTORICO },
  });
  return ChatSchema.parse(data);
}

/** `POST /chats/{chatId}/mensagens` → `201` com a mensagem gravada. Somente leitura responde 409 `CHAT_SOMENTE_LEITURA`. */
export async function enviarMensagem(chatId: string, texto: string): Promise<Mensagem> {
  const corpo = EnviarMensagemRequestSchema.parse({ texto });
  const { data } = await api.post(`/chats/${chatId}/mensagens`, corpo);
  return MensagemSchema.parse(data);
}

/** `POST /chats/{chatId}/entregues`: as mensagens recebidas chegaram ao aparelho. */
export async function marcarEntregues(chatId: string): Promise<void> {
  await api.post(`/chats/${chatId}/entregues`);
}

/** `POST /chats/{chatId}/lidas`: a conversa está na tela. Também vale como entregue. */
export async function marcarLidas(chatId: string): Promise<void> {
  await api.post(`/chats/${chatId}/lidas`);
}
