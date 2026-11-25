/** Espelha `CicloPlano` do backend (`financeiro.plano.enums`): periodicidade da cobrança. */
export const CicloPlano = {
  MENSAL: "MENSAL",
} as const;

export type CicloPlano = (typeof CicloPlano)[keyof typeof CicloPlano];

/**
 * Espelha `StatusAssinatura` do backend (`financeiro.assinaturagold.enums`).
 * `PENDENTE`: cobrança ainda não confirmada; `CANCELADA`: renovação cancelada
 * ou tentativa recusada pelo gateway.
 */
export const StatusAssinatura = {
  PENDENTE: "PENDENTE",
  ATIVA: "ATIVA",
  CANCELADA: "CANCELADA",
} as const;

export type StatusAssinatura = (typeof StatusAssinatura)[keyof typeof StatusAssinatura];

/**
 * "/mês" ao lado do preço. O ciclo chega como texto: um ciclo que o app ainda
 * não conhece fica sem sufixo em vez de derrubar a tela.
 */
export function sufixoCiclo(ciclo: string): string {
  switch (ciclo) {
    case CicloPlano.MENSAL:
      return "/mês";
    default:
      return "";
  }
}

/**
 * Espelha `StatusCobranca` do backend (`financeiro.assinaturagold.cobranca.enums`):
 * uma tentativa de cobrança da assinatura.
 */
export const StatusCobranca = {
  PENDENTE: "PENDENTE",
  APROVADA: "APROVADA",
  RECUSADA: "RECUSADA",
} as const;

export type StatusCobranca = (typeof StatusCobranca)[keyof typeof StatusCobranca];
