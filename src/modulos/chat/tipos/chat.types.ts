import { z } from "zod";

import { respostaPaginadaSchema } from "../../../comum/tipos/api";
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

/** Conversas por página da tela 42 (padrão da API, de 1 a 50). */
export const TAMANHO_PAGINA_CONVERSAS = 20;

/**
 * Item de `GET /chats` (`ConversaResponse`, ETI-103). `candidaturaId` abre o
 * chat (telas 21 e 22). `ultimaMensagem` é `null` enquanto ninguém escreveu;
 * `motivoSomenteLeitura`, enquanto o chat recebe mensagens. Conta encerrada
 * vem como "Usuário excluído", sem foto.
 */
export const ConversaSchema = z.object({
  chatId: z.string(),
  candidaturaId: z.string(),
  outraParte: z.object({
    nome: z.string(),
    fotoUrl: z.string().nullable(),
    fotoExpiraEm: z.string().nullable(),
    papel: z.enum(PapelNoChat),
  }),
  tituloAnuncio: z.string(),
  // Vem como texto do back: um status que o app ainda não conhece vira `null`
  // (o selo sai pelo somente leitura) em vez de invalidar a lista inteira.
  statusCandidatura: z.enum(StatusAplicacao).nullable().catch(null),
  ultimaMensagem: z
    .object({
      texto: z.string(),
      enviadaEm: z.string(),
      enviadaPorMim: z.boolean(),
    })
    .nullable(),
  mensagensNaoLidas: z.number().int(),
  isSomenteLeitura: z.boolean(),
  motivoSomenteLeitura: z.enum(MotivoSomenteLeitura).nullable().catch(null),
});

export type Conversa = z.infer<typeof ConversaSchema>;

/**
 * Resposta de `GET /chats` (`ConversasResponse`): a página, da última mensagem
 * mais recente pra mais antiga, e `totalComNaoLidas`, as conversas do papel
 * ativo com mensagem não lida em todas as páginas ("N não lidas").
 */
export const ConversasResponseSchema = z.object({
  conversas: respostaPaginadaSchema(ConversaSchema),
  totalComNaoLidas: z.number().int(),
});

export type ConversasResponse = z.infer<typeof ConversasResponseSchema>;
