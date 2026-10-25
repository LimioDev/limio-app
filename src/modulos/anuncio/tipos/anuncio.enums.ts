/** Espelha `StatusAnuncio` do backend (`modulos/anuncio/enums`). */
export const StatusAnuncio = {
  PUBLICADO: "PUBLICADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AGUARDANDO_VALIDACAO: "AGUARDANDO_VALIDACAO",
  CONCLUIDO: "CONCLUIDO",
  ENCERRADO: "ENCERRADO",
} as const;

export type StatusAnuncio = (typeof StatusAnuncio)[keyof typeof StatusAnuncio];
