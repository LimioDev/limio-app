/** Espelha `StatusAnuncio` do backend (`modulos/anuncio/enums`). */
export const StatusAnuncio = {
  PUBLICADO: "PUBLICADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AGUARDANDO_VALIDACAO: "AGUARDANDO_VALIDACAO",
  CONCLUIDO: "CONCLUIDO",
  ENCERRADO: "ENCERRADO",
} as const;

export type StatusAnuncio = (typeof StatusAnuncio)[keyof typeof StatusAnuncio];

/** Filtro "Quando" do mural (tela 28a). Nome provisório: o ETI-73 ainda não fixou o contrato. */
export const QuandoMural = {
  QUALQUER: "QUALQUER",
  ESTA_SEMANA: "ESTA_SEMANA",
  FIM_DE_SEMANA: "FIM_DE_SEMANA",
} as const;

export type QuandoMural = (typeof QuandoMural)[keyof typeof QuandoMural];

export const OPCOES_QUANDO: readonly QuandoMural[] = [
  QuandoMural.QUALQUER,
  QuandoMural.ESTA_SEMANA,
  QuandoMural.FIM_DE_SEMANA,
];

export function rotuloQuando(quando: QuandoMural): string {
  switch (quando) {
    case QuandoMural.QUALQUER:
      return "Qualquer";
    case QuandoMural.ESTA_SEMANA:
      return "Esta semana";
    case QuandoMural.FIM_DE_SEMANA:
      return "Fim de semana";
  }
}

/** Espelha `StatusCandidatura` do backend (valores provisórios até o ETI-73/ETI-75). */
export const StatusCandidatura = {
  ENVIADA: "ENVIADA",
  ESCOLHIDA: "ESCOLHIDA",
  CANCELADA: "CANCELADA",
} as const;

export type StatusCandidatura =
  (typeof StatusCandidatura)[keyof typeof StatusCandidatura];
