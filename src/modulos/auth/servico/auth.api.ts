import * as Device from "expo-device";

import {
  api,
  garantirTokenAcessoValido,
  obterRefreshToken,
  renovarSessao,
} from "../../../comum/lib/api";
import { TokensSessaoSchema, type TokensSessao } from "../../../comum/tipos/sessao";
import {
  CadastroRequestSchema,
  LoginRequestSchema,
  PapelAtivoResponseSchema,
  PapelAlternavelSchema,
  UsuarioResponseSchema,
  type CadastroRequest,
  type PapelAlternavel,
  type PapelAtivoResponse,
  type UsuarioResponse,
} from "../tipos/auth.types";

export async function cadastrarUsuario(
  request: CadastroRequest,
): Promise<UsuarioResponse> {
  const corpo = CadastroRequestSchema.parse(request);
  const { data } = await api.post("/auth/cadastro", corpo);
  return UsuarioResponseSchema.parse(data);
}

export async function autenticar(
  email: string,
  senha: string,
): Promise<TokensSessao> {
  // Nome do aparelho (ex.: "iPhone da Maria") identifica a sessão; sem ele a API usa o User-Agent.
  const dispositivo = (Device.deviceName ?? Device.modelName ?? undefined)?.slice(0, 255);
  const corpo = LoginRequestSchema.parse({ email, senha, dispositivo });
  const { data } = await api.post("/auth/login", corpo);
  return TokensSessaoSchema.parse(data);
}

/** Revoga só a sessão deste aparelho. Idempotente no backend (204 sempre). */
export async function encerrarSessao(): Promise<void> {
  await garantirTokenAcessoValido();
  const refreshToken = await obterRefreshToken();
  if (!refreshToken) {
    return;
  }
  await api.post("/auth/logout", { refreshToken });
}

/**
 * Revoga uma sessão que o app recebeu mas não vai usar (ex.: login de `ADMIN`).
 * Usa os tokens recebidos, não os do aparelho. Melhor esforço: se falhar, o
 * refresh token expira sozinho no backend.
 */
export async function revogarSessaoNaoSalva(tokens: TokensSessao): Promise<void> {
  await api
    .post(
      "/auth/logout",
      { refreshToken: tokens.refreshToken },
      { headers: { Authorization: `Bearer ${tokens.token}` } },
    )
    .catch(() => {});
}

/**
 * Troca o papel ativo. Devolve `null` se a sessão caiu no caminho (a renovação
 * foi recusada) — o store já foi zerado por `aoExpirar` e não há papel a aplicar.
 */
export async function trocarPapelAtivo(
  papel: PapelAlternavel,
): Promise<PapelAtivoResponse | null> {
  const { data } = await api.patch("/auth/papel-ativo", {
    papel: PapelAlternavelSchema.parse(papel),
  });
  const resposta = PapelAtivoResponseSchema.parse(data);
  // O token de acesso em uso ainda carrega o papel antigo, e é ele que os
  // outros módulos do backend leem — renova pra sair com o papel novo. A troca
  // já foi gravada: sem rede agora (`undefined`), o interceptor renova no próximo 401.
  const tokenNovo = await renovarSessao().catch(() => undefined);
  return tokenNovo === null ? null : resposta;
}
