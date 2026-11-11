/**
 * Espelha `StatusAplicacao` do backend (`modulos/anuncio/enums/StatusAplicacao.java`).
 * Fica em `comum/` porque o `anuncio` (candidatura), o `chat` (cabeçalho e
 * "Escolher") e o `perfil` (itens da cota do mês) leem o status da candidatura.
 */
export const StatusAplicacao = {
  ENVIADA: "ENVIADA",
  ESCOLHIDA: "ESCOLHIDA",
  RECUSADA: "RECUSADA",
  AGUARDANDO_VALIDACAO: "AGUARDANDO_VALIDACAO",
  CONCLUIDA: "CONCLUIDA",
  ENCERRADA: "ENCERRADA",
} as const;

export type StatusAplicacao =
  (typeof StatusAplicacao)[keyof typeof StatusAplicacao];
