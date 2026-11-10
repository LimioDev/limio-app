/** Espelha `StatusAnuncio` do backend (`modulos/anuncio/enums`). */
export const StatusAnuncio = {
  PUBLICADO: "PUBLICADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AGUARDANDO_VALIDACAO: "AGUARDANDO_VALIDACAO",
  CONCLUIDO: "CONCLUIDO",
  ENCERRADO: "ENCERRADO",
} as const;

export type StatusAnuncio = (typeof StatusAnuncio)[keyof typeof StatusAnuncio];

/**
 * Espelha `QuandoMural` do backend, filtro "Quando" do mural (tela 28a). A
 * doc do ETI-73 escreve `esta-semana`, mas o `QuandoMuralConverter` também
 * aceita o nome da constante.
 */
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

// Subiu pro `comum/` (o chat também usa); o re-export mantém os imports antigos.
export { StatusAplicacao } from "../../../comum/tipos/aplicacao";

/**
 * Espelha `AbaCandidatura` do backend — abas da tela 32 "Aplicações" (ETI-77).
 * Qual status cai em qual aba quem decide é a API (`AbaCandidatura.de`).
 */
export const AbaCandidatura = {
  PENDENTES: "PENDENTES",
  COMBINADAS: "COMBINADAS",
  HISTORICO: "HISTORICO",
} as const;

export type AbaCandidatura = (typeof AbaCandidatura)[keyof typeof AbaCandidatura];

export const OPCOES_ABA_CANDIDATURA: readonly AbaCandidatura[] = [
  AbaCandidatura.PENDENTES,
  AbaCandidatura.COMBINADAS,
  AbaCandidatura.HISTORICO,
];

export function rotuloAbaCandidatura(aba: AbaCandidatura): string {
  switch (aba) {
    case AbaCandidatura.PENDENTES:
      return "Pendentes";
    case AbaCandidatura.COMBINADAS:
      return "Combinadas";
    case AbaCandidatura.HISTORICO:
      return "Histórico";
  }
}
