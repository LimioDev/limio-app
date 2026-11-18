import { api } from "../../../comum/lib/api";
import {
  AssinarGoldResponseSchema,
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
