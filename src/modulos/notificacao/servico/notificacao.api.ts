import { isAxiosError } from "axios";

import { api } from "../../../comum/lib/api";
import {
  NaoLidasResponseSchema,
  NotificacoesResponseSchema,
  type NaoLidasResponse,
  type NotificacoesResponse,
} from "../tipos/notificacao.types";

/** Página de 20, da mais nova pra mais antiga; `pagina` começa em 0. */
export async function listarNotificacoes(pagina: number): Promise<NotificacoesResponse> {
  const { data } = await api.get("/notificacoes", { params: { pagina } });
  return NotificacoesResponseSchema.parse(data);
}

/** Idempotente: marcar de novo mantém a data da primeira leitura. */
export async function marcarNotificacaoComoLida(
  notificacaoId: string,
): Promise<NaoLidasResponse> {
  const { data } = await api.post(`/notificacoes/${notificacaoId}/lida`);
  return NaoLidasResponseSchema.parse(data);
}

export async function marcarTodasNotificacoesComoLidas(): Promise<NaoLidasResponse> {
  const { data } = await api.post("/notificacoes/lidas");
  return NaoLidasResponseSchema.parse(data);
}

/**
 * Confere, antes de abrir a tela ligada, se o anúncio ou serviço ainda existe
 * (a tela 43 avisa e fica na lista quando não existe). Só o 404 conta como
 * "não existe mais"; outra falha deixa abrir, e a própria tela trata o erro.
 * O corpo não é usado, por isso não passa por schema.
 */
export async function recursoAindaExiste(caminho: string): Promise<boolean> {
  try {
    await api.get(caminho);
    return true;
  } catch (erro) {
    if (isAxiosError(erro) && erro.response?.status === 404) {
      return false;
    }
    return true;
  }
}
