/** Canais de notificação — mesmos nomes dos campos de `PreferenciaNotificacao` no backend. */
export const CanalNotificacao = {
  PUSH: "push",
  EMAIL: "email",
  SMS: "sms",
  WHATSAPP: "whatsapp",
} as const;

export type CanalNotificacao =
  (typeof CanalNotificacao)[keyof typeof CanalNotificacao];

/** Ordem da seção "Notificações" na tela 11 Ajustes. */
export const CANAIS_NOTIFICACAO: readonly CanalNotificacao[] = [
  CanalNotificacao.PUSH,
  CanalNotificacao.EMAIL,
  CanalNotificacao.SMS,
  CanalNotificacao.WHATSAPP,
];

export function rotuloCanal(canal: CanalNotificacao): string {
  switch (canal) {
    case CanalNotificacao.PUSH:
      return "Push";
    case CanalNotificacao.EMAIL:
      return "E-mail";
    case CanalNotificacao.SMS:
      return "SMS";
    case CanalNotificacao.WHATSAPP:
      return "WhatsApp";
  }
}
