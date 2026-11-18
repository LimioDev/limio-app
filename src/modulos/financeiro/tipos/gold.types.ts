import { z } from "zod";

import { CicloPlano, StatusAssinatura } from "./gold.enums";

/** Espelha `CartaoSalvoResponse` do backend: só bandeira e últimos 4 dígitos. */
export const CartaoSalvoSchema = z.object({
  bandeira: z.string(),
  ultimos4: z.string(),
});

export type CartaoSalvo = z.infer<typeof CartaoSalvoSchema>;

/**
 * Espelha `ConsultarGoldResponse` do backend — `GET /financeiro/gold`
 * (ETI-81). Preço e ciclo vêm da API, nunca fixos no app. `cartaoSalvo` é
 * nulo quando o Prestador ainda não tem cartão.
 */
export const PlanoGoldResponseSchema = z.object({
  codigoPlano: z.string(),
  nome: z.string(),
  precoCentavos: z.number().int().nonnegative(),
  moeda: z.string(),
  // Ciclo novo no back não pode derrubar a tela: fica sem o "/mês".
  ciclo: z.enum(CicloPlano).or(z.string()),
  cartaoSalvo: CartaoSalvoSchema.nullable(),
});

export type PlanoGoldResponse = z.infer<typeof PlanoGoldResponseSchema>;

/**
 * Espelha `AssinarGoldRequest` do backend. Sem `gatewayToken`: a cobrança usa
 * o cartão salvo do Prestador. O app nunca recebe nem guarda o token do
 * gateway (o `GET` só devolve bandeira e últimos 4).
 */
export interface AssinarGoldRequest {
  codigoPlano: string;
}

/**
 * Espelha `AssinarGoldResponse` do backend — `POST /financeiro/gold/assinatura`.
 * `renovaEm` é o fim do ciclo pago (`Instant`, em UTC).
 */
export const AssinarGoldResponseSchema = z.object({
  status: z.enum(StatusAssinatura).or(z.string()),
  renovaEm: z.iso.datetime({ offset: true }),
});

export type AssinarGoldResponse = z.infer<typeof AssinarGoldResponseSchema>;
