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

/**
 * Selo do item da tela 42 (Empregador: Escolhido, Candidato(a), Encerrada) e
 * da 42b (Prestador: Combinado, Pendente, Encerrada). Vem do status da
 * candidatura e do somente leitura (ver `seloConversa`).
 */
export const SeloConversa = {
  ESCOLHIDO: "ESCOLHIDO",
  CANDIDATO: "CANDIDATO",
  COMBINADO: "COMBINADO",
  PENDENTE: "PENDENTE",
  ENCERRADA: "ENCERRADA",
} as const;

export type SeloConversa = (typeof SeloConversa)[keyof typeof SeloConversa];
