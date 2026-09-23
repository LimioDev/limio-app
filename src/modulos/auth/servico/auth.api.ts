import { api } from "../../../comum/lib/api";
import {
  CadastroRequestSchema,
  UsuarioResponseSchema,
  type CadastroRequest,
  type UsuarioResponse,
} from "../tipos/auth.types";

export async function cadastrarUsuario(
  request: CadastroRequest,
): Promise<UsuarioResponse> {
  const corpo = CadastroRequestSchema.parse(request);
  const { data } = await api.post("/auth/cadastro", corpo);
  return UsuarioResponseSchema.parse(data);
}
