import { api } from "../../../comum/lib/api";
import {
  PainelEmpregadorResponseSchema,
  type PainelEmpregadorResponse,
} from "../tipos/anuncio.types";

/** Resumo dos anúncios do Empregador logado — só os do perfil dele (ETI-52). */
export async function buscarPainelEmpregador(): Promise<PainelEmpregadorResponse> {
  const { data } = await api.get("/anuncios/painel-empregador");
  return PainelEmpregadorResponseSchema.parse(data);
}
