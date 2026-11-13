import { StatusAplicacao } from "../../../comum/tipos/aplicacao";

/** Espelha `Plano` do backend (`comum.portas.enums`). FREE tem teto mensal de escolhas; GOLD não tem. */
export const Plano = {
  FREE: "FREE",
  GOLD: "GOLD",
} as const;

export type Plano = (typeof Plano)[keyof typeof Plano];

/**
 * Rótulo do status da candidatura em "Onde você usou sua cota". O status chega
 * como texto em `EscolhaDoMesResponse.status`: um valor que o app ainda não
 * conhece mostra "—" em vez de derrubar a tela. `ENVIADA` e `RECUSADA` só
 * aparecem se um fluxo futuro desfizer a escolha.
 */
export function rotuloStatusEscolha(status: string): string {
  switch (status) {
    case StatusAplicacao.ESCOLHIDA:
      return "Combinado";
    case StatusAplicacao.AGUARDANDO_VALIDACAO:
      return "Aguardando validação";
    case StatusAplicacao.CONCLUIDA:
      return "Concluído";
    case StatusAplicacao.ENCERRADA:
    case StatusAplicacao.RECUSADA:
    case StatusAplicacao.ENVIADA:
      return "Cancelado";
    default:
      return "—";
  }
}
