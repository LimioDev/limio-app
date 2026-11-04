/**
 * Espelha `StatusAplicacao` do backend (`modulos/anuncio/enums/StatusAplicacao.java`).
 * Fica em `comum/` porque o `anuncio` (candidatura) e o `chat` (cabeçalho e
 * "Escolher") leem o status da candidatura.
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
