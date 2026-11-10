import { z } from "zod";

import { StatusAplicacao } from "../../../comum/tipos/aplicacao";
import { MotivoSomenteLeitura, PapelNoChat, TipoEventoChat } from "./chat.enums";

/** Limite do texto da mensagem (`EnviarMensagemRequest.TAMANHO_MAXIMO`), provisório até a decisão do PO. */
export const TEXTO_MENSAGEM_MAX = 2000;

/** Mensagens por página do histórico (padrão da API). */
export const TAMANHO_PAGINA_HISTORICO = 30;

/**
 * `MensagemResponse` do backend. `texto` é o texto exibido (com o mascaramento
 * da US50, quando entrar). `entregueEm` e `lidaEm` são `null` até a outra
 * parte confirmar; `LIDA` preenche os dois.
 */
export const MensagemSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  remetenteId: z.string(),
  texto: z.string(),
  dataEnvio: z.string(),
  entregueEm: z.string().nullable(),
  lidaEm: z.string().nullable(),
});

export type Mensagem = z.infer<typeof MensagemSchema>;

/**
 * Resposta de `GET /candidaturas/{candidaturaId}/chat` (`ChatResponse`, telas
 * 21 e 22). `historico.mensagens` vem da mais nova para a mais antiga; para as
 * anteriores, o app manda em `antesDe` o id da última (a mais antiga).
 * `outraParte.nome` vem "Usuário excluído", sem foto, quando a conta foi
 * encerrada.
 */
export const ChatSchema = z.object({
  id: z.string(),
  candidaturaId: z.string(),
  statusCandidatura: z.enum(StatusAplicacao),
  outraParte: z.object({
    nome: z.string(),
    fotoUrl: z.string().nullable(),
    fotoExpiraEm: z.string().nullable(),
    papel: z.enum(PapelNoChat),
  }),
  anuncio: z.object({
    titulo: z.string(),
    categoria: z.string(),
  }),
  isSomenteLeitura: z.boolean(),
  motivoSomenteLeitura: z.enum(MotivoSomenteLeitura).nullable(),
  historico: z.object({
    mensagens: z.array(MensagemSchema),
    tamanho: z.number().int(),
    temMais: z.boolean(),
  }),
});

export type Chat = z.infer<typeof ChatSchema>;

/** Corpo de `POST /chats/{chatId}/mensagens`: texto sem espaços sobrando, de 1 a 2000 caracteres. */
export const EnviarMensagemRequestSchema = z.object({
  texto: z.string().trim().min(1).max(TEXTO_MENSAGEM_MAX),
});

export type EnviarMensagemRequest = z.infer<typeof EnviarMensagemRequestSchema>;

/**
 * O que chega pelo canal em tempo real (`EventoChatResponse`). `MENSAGEM_NOVA`
 * traz `mensagem`; `ENTREGUE` e `LIDA` trazem `mensagemIds` (mensagens minhas
 * que a outra parte confirmou). O campo que não se aplica vem `null`.
 */
export const EventoChatSchema = z.object({
  tipo: z.enum(TipoEventoChat),
  chatId: z.string(),
  mensagem: MensagemSchema.nullable(),
  mensagemIds: z.array(z.string()).nullable(),
  em: z.string(),
});

export type EventoChat = z.infer<typeof EventoChatSchema>;
