import { z } from "zod";

import { api } from "../lib/api";
import {
  EnderecoSalvoRequestSchema,
  EnderecoSalvoResponseSchema,
  type EnderecoSalvoRequest,
  type EnderecoSalvoResponse,
} from "../tipos/endereco";

export const ROTA_ENDERECOS = "/conta/perfil-empregador/enderecos";

/** Endereços do Empregador logado, já na ordem da API (padrão primeiro, depois por apelido). */
export async function listarEnderecos(): Promise<EnderecoSalvoResponse[]> {
  const { data } = await api.get(ROTA_ENDERECOS);
  return z.array(EnderecoSalvoResponseSchema).parse(data);
}

/** Cadastra um endereço salvo do Empregador logado. */
export async function criarEndereco(
  request: EnderecoSalvoRequest,
): Promise<EnderecoSalvoResponse> {
  const corpo = EnderecoSalvoRequestSchema.parse(request);
  const { data } = await api.post(ROTA_ENDERECOS, corpo);
  return EnderecoSalvoResponseSchema.parse(data);
}
