import { z } from "zod";

import { respostaPaginadaSchema } from "../../../comum/tipos/api";
import { TipoNotificacao } from "./notificacao.enums";

/** `NotificacaoResponse` do backend (ETI-110). `lidaEm` nulo = não lida. */
export const NotificacaoSchema = z.object({
  id: z.string(),
  // O back acrescenta tipos sem migration (ETI-112). Um tipo que o app ainda
  // não conhece vira `null` (ícone genérico, sem tela ligada) em vez de
  // invalidar a lista inteira.
  tipo: z.enum(TipoNotificacao).nullable().catch(null),
  titulo: z.string(),
  corpo: z.string(),
  enviadaEm: z.string(),
  lidaEm: z.string().nullable(),
  /** Anúncio ligado, se houver: é por ele que o app abre a tela do tipo. */
  anuncioId: z.string().nullable(),
});

export type Notificacao = z.infer<typeof NotificacaoSchema>;

/** `GET /notificacoes`: a página e o total de não lidas do usuário inteiro (número do sino). */
export const NotificacoesResponseSchema = z.object({
  notificacoes: respostaPaginadaSchema(NotificacaoSchema),
  naoLidas: z.number().int(),
});

export type NotificacoesResponse = z.infer<typeof NotificacoesResponseSchema>;

/** Resposta das marcações: o total de não lidas depois de marcar. */
export const NaoLidasResponseSchema = z.object({
  naoLidas: z.number().int(),
});

export type NaoLidasResponse = z.infer<typeof NaoLidasResponseSchema>;

/**
 * `data` do push (ETI-112): o que o app precisa pra abrir a mesma tela que o
 * item da tela 43 abriria. `anuncioId` só vem quando há anúncio ligado.
 */
export const DadosPushSchema = z.object({
  notificacaoId: z.string(),
  tipo: z.enum(TipoNotificacao).nullable().catch(null),
  anuncioId: z
    .string()
    .nullish()
    .transform((valor) => valor ?? null),
});

export type DadosPush = z.infer<typeof DadosPushSchema>;
