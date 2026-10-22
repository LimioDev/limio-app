import { api } from "../../../comum/lib/api";
import {
  ContatoResponseSchema,
  EditarNomeExibicaoRequestSchema,
  PerfilEmpregadorResponseSchema,
  TrocarEmailRequestSchema,
  TrocarTelefoneRequestSchema,
  type ContatoResponse,
  type PerfilEmpregadorResponse,
  type TrocarEmailRequest,
  type TrocarTelefoneRequest,
} from "../tipos/perfil.types";

/** Perfil do usuário logado. O backend cria o perfil no primeiro acesso. */
export async function buscarMeuPerfil(): Promise<PerfilEmpregadorResponse> {
  const { data } = await api.get("/conta/perfil-empregador");
  return PerfilEmpregadorResponseSchema.parse(data);
}

export async function editarNomeExibicao(
  nomeExibicao: string,
): Promise<PerfilEmpregadorResponse> {
  const corpo = EditarNomeExibicaoRequestSchema.parse({ nomeExibicao });
  const { data } = await api.patch("/conta/perfil-empregador/nome-exibicao", corpo);
  return PerfilEmpregadorResponseSchema.parse(data);
}

/** Grava o e-mail novo, zera a confirmação e manda um link novo. */
export async function trocarEmail(
  request: TrocarEmailRequest,
): Promise<ContatoResponse> {
  const corpo = TrocarEmailRequestSchema.parse(request);
  const { data } = await api.patch("/auth/email", corpo);
  return ContatoResponseSchema.parse(data);
}

/** Grava o telefone novo e zera a confirmação. */
export async function trocarTelefone(
  request: TrocarTelefoneRequest,
): Promise<ContatoResponse> {
  const corpo = TrocarTelefoneRequestSchema.parse(request);
  const { data } = await api.patch("/auth/telefone", corpo);
  return ContatoResponseSchema.parse(data);
}
