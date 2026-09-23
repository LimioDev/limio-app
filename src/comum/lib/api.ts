import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import type { TokensAutenticacao } from "../tipos/api";

const CHAVE_TOKEN_ACESSO = "limio.tokenAcesso";
const CHAVE_TOKEN_RENOVACAO = "limio.tokenRenovacao";

// Emulador Android enxerga o localhost da máquina host como 10.0.2.2.
const baseURL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://10.0.2.2:8080";

// eslint-disable-next-line import/no-named-as-default-member -- axios expõe `create` tanto como default quanto named export
export const api = axios.create({ baseURL });

export class ConflitoDeEstado extends Error {
  constructor(mensagem = "O estado mudou antes desta requisição terminar.") {
    super(mensagem);
    this.name = "ConflitoDeEstado";
  }
}

export async function obterTokenAcesso(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN_ACESSO);
}

async function obterTokenRenovacao(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN_RENOVACAO);
}

export async function salvarTokens(tokens: TokensAutenticacao): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN_ACESSO, tokens.tokenAcesso);
  await SecureStore.setItemAsync(CHAVE_TOKEN_RENOVACAO, tokens.tokenRenovacao);
}

export async function limparTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN_ACESSO);
  await SecureStore.deleteItemAsync(CHAVE_TOKEN_RENOVACAO);
}

api.interceptors.request.use(async (config) => {
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

async function renovarToken(): Promise<string | null> {
  const tokenRenovacao = await obterTokenRenovacao();
  if (!tokenRenovacao) {
    return null;
  }

  try {
    const resposta = await axios.post<TokensAutenticacao>(
      `${baseURL}/auth/renovar`,
      { tokenRenovacao },
    );
    await salvarTokens(resposta.data);
    return resposta.data.tokenAcesso;
  } catch {
    return null;
  }
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
      !configOriginal._jaTentouRenovar
    ) {
      configOriginal._jaTentouRenovar = true;

      if (!promessaRenovacao) {
        promessaRenovacao = renovarToken().finally(() => {
          promessaRenovacao = null;
        });
      }

      const novoTokenAcesso = await promessaRenovacao;

      if (!novoTokenAcesso) {
        await limparTokens();
        return Promise.reject(erro);
      }

      configOriginal.headers.set("Authorization", `Bearer ${novoTokenAcesso}`);
      return api(configOriginal);
    }

    return Promise.reject(erro);
  },
);
