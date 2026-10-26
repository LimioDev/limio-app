import { z } from "zod";

import { api } from "../lib/api";
import { EnderecoSalvoResponseSchema, type EnderecoSalvoResponse } from "../tipos/endereco";

export const ROTA_ENDERECOS = "/conta/perfil-empregador/enderecos";

/** Endereços do Empregador logado, já na ordem da API (padrão primeiro, depois por apelido). */
export async function listarEnderecos(): Promise<EnderecoSalvoResponse[]> {
  const { data } = await api.get(ROTA_ENDERECOS);
  return z.array(EnderecoSalvoResponseSchema).parse(data);
}
