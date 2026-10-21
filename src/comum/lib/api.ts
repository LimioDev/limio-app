import axios, {
  AxiosError,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

import type { PapelUsuario } from "../tipos/papel";
import { TokensSessaoSchema, type TokensSessao } from "../tipos/sessao";

// Sessão inteira numa chave só (JSON de `TokensSessao`): o SecureStore não tem
// escrita em lote, e chaves separadas deixariam o app com token de acesso novo
// e refresh token antigo se ele fechasse no meio da gravação.
const CHAVE_SESSAO = "limio.sessao";

// Margem pra não mandar um token que expira no meio do caminho.
const MARGEM_EXPIRACAO_MS = 30_000;

// 401 nestas rotas é resposta de negócio (ex.: CREDENCIAIS_INVALIDAS,
// SENHA_ATUAL_INCORRETA, TOKEN_RECUPERACAO_INVALIDO), não token vencido. `/auth/senha` é autenticada, mas
// leva o refresh token no corpo: quem chama renova antes (`garantirTokenAcessoValido`),
// e uma renovação reativa rotacionaria o token e a retentativa iria com o antigo.
const ROTAS_SEM_RENOVACAO = [
  "/auth/login",
  "/auth/refresh",
  "/auth/cadastro",
  "/auth/recuperar-senha",
  "/auth/redefinir-senha",
  "/auth/senha",
];

// Vem do .env (não versionado — ver .env.example). Fallback: emulador Android enxerga o
// localhost da máquina host como 10.0.2.2.
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8080";

// eslint-disable-next-line import/no-named-as-default-member -- axios expõe `create` tanto como default quanto named export
export const api = axios.create({ baseURL });

export class ConflitoDeEstado extends Error {
  constructor(mensagem = "O estado mudou antes desta requisição terminar.") {
    super(mensagem);
    this.name = "ConflitoDeEstado";
  }
}

/**
 * Avisos pra `comum/store/sessao.ts`. Registro em vez de import direto porque
 * o store já importa este arquivo (evita ciclo).
 */
interface EventosSessao {
  aoRenovar: (tokens: TokensSessao) => void;
  aoExpirar: () => void;
}

let eventosSessao: EventosSessao | null = null;

export function registrarEventosSessao(eventos: EventosSessao): void {
  eventosSessao = eventos;
}

/** Sessão guardada no aparelho; `null` se não há (ou se o conteúdo não é uma sessão válida). */
async function lerSessaoSalva(): Promise<TokensSessao | null> {
  const bruto = await SecureStore.getItemAsync(CHAVE_SESSAO);
  if (!bruto) {
    return null;
  }
  try {
    const resultado = TokensSessaoSchema.safeParse(JSON.parse(bruto));
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

export async function obterTokenAcesso(): Promise<string | null> {
  return (await lerSessaoSalva())?.token ?? null;
}

export async function obterRefreshToken(): Promise<string | null> {
  return (await lerSessaoSalva())?.refreshToken ?? null;
}

export async function salvarSessao(tokens: TokensSessao): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(tokens));
}

export async function salvarPapelAtivo(papel: PapelUsuario): Promise<void> {
  const sessao = await lerSessaoSalva();
  if (sessao) {
    await salvarSessao({ ...sessao, papel });
  }
}

/** Papel da sessão guardada no aparelho; `null` se não há sessão. */
export async function lerPapelSalvo(): Promise<PapelUsuario | null> {
  return (await lerSessaoSalva())?.papel ?? null;
}

export async function limparSessaoSalva(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}

api.interceptors.request.use(async (config) => {
  // Quem já mandou o próprio `Authorization` (ex.: revogar uma sessão que não
  // foi salva) não tem o header trocado pelo da sessão do aparelho.
  if (config.headers.has("Authorization")) {
    return config;
  }
  const tokenAcesso = await obterTokenAcesso();
  if (tokenAcesso) {
    config.headers.set("Authorization", `Bearer ${tokenAcesso}`);
  }
  return config;
});

// Fila de refresh: uma única promessa compartilhada. Sem isso, N requisições
// simultâneas com 401 disparariam N refreshes — o primeiro rotaciona o
// refresh token e invalida os outros, derrubando o usuário sem motivo.
let promessaRenovacao: Promise<string | null> | null = null;

async function executarRenovacao(): Promise<string | null> {
  const refreshToken = await obterRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const resposta = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken,
    });
    const tokens = TokensSessaoSchema.parse(resposta.data);
    await salvarSessao(tokens);
    eventosSessao?.aoRenovar(tokens);
    return tokens.token;
  } catch (erro) {
    // Só derruba a sessão quando a API recusa o refresh (revogado, expirado,
    // conta suspensa). Falha de rede não é motivo pra deslogar.
    const status = isAxiosError(erro) ? erro.response?.status : undefined;
    if (status === 401 || status === 403) {
      await limparSessaoSalva();
      eventosSessao?.aoExpirar();
      return null;
    }
    throw erro;
  }
}

/**
 * Troca o refresh token por um par novo (`POST /auth/refresh`). Devolve o
 * token de acesso novo, ou `null` se a sessão não vale mais. Lança em falha
 * de rede.
 */
export function renovarSessao(): Promise<string | null> {
  if (!promessaRenovacao) {
    promessaRenovacao = executarRenovacao().finally(() => {
      promessaRenovacao = null;
    });
  }
  return promessaRenovacao;
}

/**
 * Renova antes da hora quando o corpo da requisição carrega o refresh token
 * (logout): a renovação reativa do interceptor rotacionaria o token e a
 * retentativa iria com o antigo.
 */
export async function garantirTokenAcessoValido(): Promise<void> {
  const expiraEm = (await lerSessaoSalva())?.expiraEm;
  if (expiraEm && Date.parse(expiraEm) - MARGEM_EXPIRACAO_MS > Date.now()) {
    return;
  }
  await renovarSessao();
}

type ConfigComRetentativa = InternalAxiosRequestConfig & {
  _jaTentouRenovar?: boolean;
};

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro: AxiosError) => {
    if (erro.response?.status === 409) {
      return Promise.reject(new ConflitoDeEstado());
    }

    const configOriginal = erro.config as ConfigComRetentativa | undefined;

    if (
      erro.response?.status === 401 &&
      configOriginal &&
      !configOriginal._jaTentouRenovar &&
      !ROTAS_SEM_RENOVACAO.includes(configOriginal.url ?? "")
    ) {
      configOriginal._jaTentouRenovar = true;

      let novoTokenAcesso: string | null;
      try {
        novoTokenAcesso = await renovarSessao();
      } catch {
        return Promise.reject(erro);
      }

      if (!novoTokenAcesso) {
        return Promise.reject(erro);
      }

      configOriginal.headers.set("Authorization", `Bearer ${novoTokenAcesso}`);
      return api(configOriginal);
    }

    return Promise.reject(erro);
  },
);
