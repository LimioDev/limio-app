/**
 * Canais de notificação — mesmos nomes dos campos de `PreferenciaNotificacao`
 * no backend. SMS saiu dos canais (ETI-134/ETI-135): nunca disparou nada.
 */
export const CanalNotificacao = {
  PUSH: "push",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
} as const;

export type CanalNotificacao =
  (typeof CanalNotificacao)[keyof typeof CanalNotificacao];

/** Ordem da seção "Notificações" na tela 11 Ajustes. */
export const CANAIS_NOTIFICACAO: readonly CanalNotificacao[] = [
  CanalNotificacao.PUSH,
  CanalNotificacao.EMAIL,
  CanalNotificacao.WHATSAPP,
];

export function rotuloCanal(canal: CanalNotificacao): string {
  switch (canal) {
    case CanalNotificacao.PUSH:
      return "Push";
    case CanalNotificacao.EMAIL:
      return "E-mail";
    case CanalNotificacao.WHATSAPP:
      return "WhatsApp";
  }
}
