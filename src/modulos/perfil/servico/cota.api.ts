import { api } from "../../../comum/lib/api";
import { CotaDoMesResponseSchema, type CotaDoMesResponse } from "../tipos/cota.types";

/** Cota do mês do Prestador logado (o dono vem do token). */
export async function buscarCotaDoMes(): Promise<CotaDoMesResponse> {
  const { data } = await api.get("/perfil/prestador/cota");
  return CotaDoMesResponseSchema.parse(data);
}
