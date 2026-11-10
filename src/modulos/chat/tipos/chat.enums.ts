/**
 * Espelha `MotivoSomenteLeitura` do backend (`modulos/chat/enums`): por que o
 * chat parou de receber mensagens. O texto da faixa (telas 22 a 22e) é do app.
 */
export const MotivoSomenteLeitura = {
  CANDIDATURA_RECUSADA: "CANDIDATURA_RECUSADA",
  CANDIDATO_DESISTIU: "CANDIDATO_DESISTIU",
  OUTRO_PRESTADOR_ESCOLHIDO: "OUTRO_PRESTADOR_ESCOLHIDO",
  ANUNCIO_CANCELADO: "ANUNCIO_CANCELADO",
  SERVICO_CANCELADO: "SERVICO_CANCELADO",
  CONTA_ENCERRADA: "CONTA_ENCERRADA",
} as const;

export type MotivoSomenteLeitura =
  (typeof MotivoSomenteLeitura)[keyof typeof MotivoSomenteLeitura];

/**
 * Espelha `PapelNoChat` do backend: o papel da outra parte na conversa.
 * `CANDIDATO` quando quem vê é o Empregador; `EMPREGADOR` quando é o Prestador.
 */
export const PapelNoChat = {
  EMPREGADOR: "EMPREGADOR",
  CANDIDATO: "CANDIDATO",
} as const;

export type PapelNoChat = (typeof PapelNoChat)[keyof typeof PapelNoChat];

/** Espelha `TipoEventoChat` do backend: o que chega em `/user/queue/chat`. */
export const TipoEventoChat = {
  MENSAGEM_NOVA: "MENSAGEM_NOVA",
  ENTREGUE: "ENTREGUE",
  LIDA: "LIDA",
} as const;

export type TipoEventoChat = (typeof TipoEventoChat)[keyof typeof TipoEventoChat];

/** Situação de uma mensagem minha no balão (os checks). */
export const SituacaoMensagem = {
  ENVIANDO: "ENVIANDO",
  NAO_ENVIADA: "NAO_ENVIADA",
  ENVIADA: "ENVIADA",
  ENTREGUE: "ENTREGUE",
  LIDA: "LIDA",
} as const;

export type SituacaoMensagem = (typeof SituacaoMensagem)[keyof typeof SituacaoMensagem];
