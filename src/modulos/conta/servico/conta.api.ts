import { api } from "../../../comum/lib/api";
import {
  EncerrarContaRequestSchema,
  PreferenciasNotificacaoSchema,
  type PreferenciasNotificacao,
} from "../tipos/conta.types";

const ROTA_PREFERENCIAS_NOTIFICACAO = "/conta/preferencias-notificacao";

export async function buscarPreferenciasNotificacao(): Promise<PreferenciasNotificacao> {
  const { data } = await api.get(ROTA_PREFERENCIAS_NOTIFICACAO);
  return PreferenciasNotificacaoSchema.parse(data);
}

/**
 * Grava os quatro canais de uma vez. Ligar/desligar o WhatsApp registra o
 * consentimento ou a revogação no backend — o app só manda o booleano.
 */
export async function atualizarPreferenciasNotificacao(
  preferencias: PreferenciasNotificacao,
): Promise<PreferenciasNotificacao> {
  const corpo = PreferenciasNotificacaoSchema.parse(preferencias);
  const { data } = await api.put(ROTA_PREFERENCIAS_NOTIFICACAO, corpo);
  return PreferenciasNotificacaoSchema.parse(data);
}

/**
 * Encerra e anonimiza a conta do usuário logado (LGPD). O backend revoga todas
 * as sessões, inclusive a deste aparelho — não há logout a fazer depois.
 */
export async function encerrarConta(): Promise<void> {
  const corpo = EncerrarContaRequestSchema.parse({ confirmacao: true });
  await api.post("/auth/encerrar-conta", corpo);
}
