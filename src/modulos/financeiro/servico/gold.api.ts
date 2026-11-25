import { api } from "../../../comum/lib/api";
import {
  AssinarGoldResponseSchema,
  AssinaturaGoldResponseSchema,
  TrocarCartaoResponseSchema,
  type AssinaturaGoldResponse,
  type TrocarCartaoRequest,
  type TrocarCartaoResponse,
  PlanoGoldResponseSchema,
  type AssinarGoldRequest,
  type AssinarGoldResponse,
  type PlanoGoldResponse,
} from "../tipos/gold.types";

/** "Consultar plano GOLD": nome, preço, ciclo e cartão salvo do Prestador logado. */
export async function consultarPlanoGold(): Promise<PlanoGoldResponse> {
  const { data } = await api.get("/financeiro/gold");
  return PlanoGoldResponseSchema.parse(data);
}

/** "Assinar GOLD": cobra no cartão salvo e libera o plano na hora. */
export async function assinarGold(pedido: AssinarGoldRequest): Promise<AssinarGoldResponse> {
  const { data } = await api.post("/financeiro/gold/assinatura", pedido);
  return AssinarGoldResponseSchema.parse(data);
}

/** "Consultar minha assinatura": status, renovação, cartão e cobranças (ETI-83). */
export async function consultarMinhaAssinatura(): Promise<AssinaturaGoldResponse> {
  const { data } = await api.get("/financeiro/gold/assinatura");
  return AssinaturaGoldResponseSchema.parse(data);
}

/** "Cancelar renovação": o GOLD continua até o fim do período pago. */
export async function cancelarRenovacao(): Promise<AssinaturaGoldResponse> {
  const { data } = await api.post("/financeiro/gold/assinatura/cancelar-renovacao");
  return AssinaturaGoldResponseSchema.parse(data);
}

/** "Trocar cartão": tokeniza no gateway e deixa o cartão novo ativo. */
export async function trocarCartao(pedido: TrocarCartaoRequest): Promise<TrocarCartaoResponse> {
  const { data } = await api.post("/financeiro/gold/cartao", pedido);
  return TrocarCartaoResponseSchema.parse(data);
}
