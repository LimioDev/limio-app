import { z } from "zod";

import { api } from "../../../comum/lib/api";
import {
  EnderecoSalvoRequestSchema,
  EnderecoSalvoResponseSchema,
  type EnderecoSalvoRequest,
  type EnderecoSalvoResponse,
} from "../tipos/endereco.types";

const BASE = "/conta/perfil-empregador/enderecos";

/** Endereços do Empregador logado, já na ordem da API (padrão primeiro, depois por apelido). */
export async function listarEnderecos(): Promise<EnderecoSalvoResponse[]> {
  const { data } = await api.get(BASE);
  return z.array(EnderecoSalvoResponseSchema).parse(data);
}

export async function criarEndereco(
  request: EnderecoSalvoRequest,
): Promise<EnderecoSalvoResponse> {
  const corpo = EnderecoSalvoRequestSchema.parse(request);
  const { data } = await api.post(BASE, corpo);
  return EnderecoSalvoResponseSchema.parse(data);
}

/** `PUT`: substitui todos os campos do endereço. */
export async function editarEndereco({
  id,
  request,
}: {
  id: string;
  request: EnderecoSalvoRequest;
}): Promise<EnderecoSalvoResponse> {
  const corpo = EnderecoSalvoRequestSchema.parse(request);
  const { data } = await api.put(`${BASE}/${id}`, corpo);
  return EnderecoSalvoResponseSchema.parse(data);
}

export async function removerEndereco(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

/** Marca como padrão e desmarca o anterior. Idempotente. */
export async function marcarEnderecoPadrao(
  id: string,
): Promise<EnderecoSalvoResponse> {
  const { data } = await api.patch(`${BASE}/${id}/padrao`);
  return EnderecoSalvoResponseSchema.parse(data);
}
