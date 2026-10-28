import { api } from "../../../comum/lib/api";
import {
  PerfilAtuacaoRequestSchema,
  PerfilAtuacaoResponseSchema,
  type PerfilAtuacaoRequest,
  type PerfilAtuacaoResponse,
} from "../tipos/atuacao.types";

export async function buscarPerfilAtuacao(): Promise<PerfilAtuacaoResponse> {
  const { data } = await api.get("/perfil/prestador/atuacao");
  return PerfilAtuacaoResponseSchema.parse(data);
}

/** Substitui o perfil de atuação inteiro; a API resolve as coordenadas e recalcula `completo`. */
export async function salvarPerfilAtuacao(
  request: PerfilAtuacaoRequest,
): Promise<PerfilAtuacaoResponse> {
  const corpo = PerfilAtuacaoRequestSchema.parse(request);
  const { data } = await api.put("/perfil/prestador/atuacao", corpo);
  return PerfilAtuacaoResponseSchema.parse(data);
}
