import * as Device from "expo-device";

import {
  api,
  garantirTokenAcessoValido,
  obterRefreshToken,
  renovarSessao,
} from "../../../comum/lib/api";
import { erroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import { TokensSessaoSchema, type TokensSessao } from "../../../comum/tipos/sessao";
import {
  AlterarSenhaRequestSchema,
  CadastroRequestSchema,
  LoginRequestSchema,
  RecuperarSenhaRequestSchema,
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
 * Pede o link de recuperação de senha. O backend responde 200 exista o e-mail
 * ou não (anti-enumeração), então não há nada a devolver.
 */
export async function solicitarRecuperacaoSenha(email: string): Promise<void> {
  const corpo = RecuperarSenhaRequestSchema.parse({ email });
  await api.post("/auth/recuperar-senha", corpo);
}

/**
 * Altera a senha do usuário logado. A sessão deste aparelho continua, com
 * tokens novos (devolvidos aqui); as dos outros aparelhos são encerradas.
 */
export async function alterarSenha(
  senhaAtual: string,
  novaSenha: string,
): Promise<TokensSessao> {
  // O refresh token vai no corpo: renova antes, porque a renovação reativa do
  // interceptor rotacionaria o token e a retentativa iria com o antigo.
  await garantirTokenAcessoValido();
  try {
    return await enviarAlteracaoSenha(senhaAtual, novaSenha);
  } catch (erro) {
    // Token recusado mesmo parecendo válido (ex.: relógio do aparelho errado):
    // renova e tenta uma vez, já com o refresh token novo no corpo. Se a
    // renovação for recusada, `aoExpirar` já derrubou a sessão.
    if (erroApi(erro)?.codigo !== CodigoErro.NAO_AUTENTICADO) {
      throw erro;
    }
    if (!(await renovarSessao())) {
      throw erro;
    }
    return enviarAlteracaoSenha(senhaAtual, novaSenha);
  }
}

async function enviarAlteracaoSenha(
  senhaAtual: string,
  novaSenha: string,
): Promise<TokensSessao> {
  const refreshToken = await obterRefreshToken();
  const corpo = AlterarSenhaRequestSchema.parse({
    senhaAtual,
    novaSenha,
    refreshToken,
  });
  const { data } = await api.patch("/auth/senha", corpo);
  return TokensSessaoSchema.parse(data);
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
