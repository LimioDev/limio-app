import { api } from "../../../comum/lib/api";
import {
  PreferenciasNotificacaoSchema,
  type PreferenciasNotificacao,
} from "../tipos/conta.types";

// Rota ainda "a definir" no contrato do ETI-34 — alinhar com o back antes do merge.
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
