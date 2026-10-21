import { z } from "zod";

import { api } from "../../../comum/lib/api";
import {
  CategoriaSchema,
  PerfilAtuacaoRequestSchema,
  PerfilAtuacaoResponseSchema,
  type Categoria,
  type PerfilAtuacaoRequest,
  type PerfilAtuacaoResponse,
} from "../tipos/atuacao.types";

/** Categorias ativas, em ordem de exibição. */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get("/categorias");
  return z.array(CategoriaSchema).parse(data);
}

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
