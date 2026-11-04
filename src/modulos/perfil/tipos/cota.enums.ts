/** Espelha `Plano` do backend (`comum.portas.enums`). FREE tem teto mensal de escolhas; GOLD não tem. */
export const Plano = {
  FREE: "FREE",
  GOLD: "GOLD",
} as const;

export type Plano = (typeof Plano)[keyof typeof Plano];

/**
 * Status da candidatura em "Onde você usou sua cota". Espelha `StatusAplicacao`
 * do backend, que chega como texto em `EscolhaDoMesResponse.status`. Fica aqui,
 * e não importado do `anuncio`, porque módulo não importa outro módulo.
 * `ENVIADA` e `RECUSADA` só aparecem se um fluxo futuro desfizer a escolha.
 */
export const StatusEscolha = {
  ENVIADA: "ENVIADA",
  ESCOLHIDA: "ESCOLHIDA",
  RECUSADA: "RECUSADA",
  AGUARDANDO_VALIDACAO: "AGUARDANDO_VALIDACAO",
  CONCLUIDA: "CONCLUIDA",
  ENCERRADA: "ENCERRADA",
} as const;

export type StatusEscolha = (typeof StatusEscolha)[keyof typeof StatusEscolha];

export function rotuloStatusEscolha(status: StatusEscolha): string {
  switch (status) {
    case StatusEscolha.ESCOLHIDA:
      return "Combinado";
    case StatusEscolha.AGUARDANDO_VALIDACAO:
      return "Aguardando validação";
    case StatusEscolha.CONCLUIDA:
      return "Concluído";
    case StatusEscolha.ENCERRADA:
    case StatusEscolha.RECUSADA:
    case StatusEscolha.ENVIADA:
      return "Cancelado";
  }
}
