/**
 * Espelha `TipoNotificacao` do backend (`modulos/notificacao/enums`, ETI-110):
 * um valor por evento de domínio. O app escolhe ícone e tela de destino pelo tipo.
 */
export const TipoNotificacao = {
  NOVO_SERVICO_NA_AREA: "NOVO_SERVICO_NA_AREA",
  NOVA_CANDIDATURA: "NOVA_CANDIDATURA",
  PRESTADOR_ESCOLHIDO: "PRESTADOR_ESCOLHIDO",
  CANDIDATURA_RECUSADA: "CANDIDATURA_RECUSADA",
  CANDIDATURA_ENCERRADA: "CANDIDATURA_ENCERRADA",
  ANUNCIO_CANCELADO: "ANUNCIO_CANCELADO",
  SERVICO_INICIADO: "SERVICO_INICIADO",
  CHECKOUT_ENVIADO: "CHECKOUT_ENVIADO",
  SERVICO_CONCLUIDO: "SERVICO_CONCLUIDO",
  AVALIACAO_RECEBIDA: "AVALIACAO_RECEBIDA",
  AVISO_DE_ANUNCIO: "AVISO_DE_ANUNCIO",
} as const;

export type TipoNotificacao = (typeof TipoNotificacao)[keyof typeof TipoNotificacao];
