import { api } from "../../../comum/lib/api";
import { ROTA_ENDERECOS } from "../../../comum/servico/endereco.api";
import {
  EnderecoSalvoResponseSchema,
  type EnderecoSalvoResponse,
} from "../../../comum/tipos/endereco";
import {
  EnderecoSalvoRequestSchema,
  type EnderecoSalvoRequest,
} from "../tipos/endereco.types";

// A listagem (`listarEnderecos`) fica em `comum/servico`: o anúncio também usa.

export async function criarEndereco(
  request: EnderecoSalvoRequest,
): Promise<EnderecoSalvoResponse> {
  const corpo = EnderecoSalvoRequestSchema.parse(request);
  const { data } = await api.post(ROTA_ENDERECOS, corpo);
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
  const { data } = await api.put(`${ROTA_ENDERECOS}/${id}`, corpo);
  return EnderecoSalvoResponseSchema.parse(data);
}

export async function removerEndereco(id: string): Promise<void> {
  await api.delete(`${ROTA_ENDERECOS}/${id}`);
}

/** Marca como padrão e desmarca o anterior. Idempotente. */
export async function marcarEnderecoPadrao(
  id: string,
): Promise<EnderecoSalvoResponse> {
  const { data } = await api.patch(`${ROTA_ENDERECOS}/${id}/padrao`);
  return EnderecoSalvoResponseSchema.parse(data);
}
