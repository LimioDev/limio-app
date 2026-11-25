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

/** Qual folha da escolha do prestador está na tela (ETI-70). */
export const EtapaEscolha = {
  /** Tela 23 "Escolher (nome)?". */
  CONFIRMAR: "CONFIRMAR",
  /** Tela 24 "Não foi possível escolher (nome)": cota do candidato esgotada. */
  COTA_ESGOTADA: "COTA_ESGOTADA",
} as const;

export type EtapaEscolha = (typeof EtapaEscolha)[keyof typeof EtapaEscolha];

/**
 * Espelha `ModoValidacao` do backend (ETI-92): como o Empregador confirma que
 * o serviço foi feito na tela 27. `PELA_FOTO` só depois do check-out.
 */
export const ModoValidacao = {
  /** "Vi no local". */
  PRESENCIAL: "PRESENCIAL",
  /** "Pela foto". */
  PELA_FOTO: "PELA_FOTO",
} as const;

export type ModoValidacao = (typeof ModoValidacao)[keyof typeof ModoValidacao];

export function rotuloModoValidacao(modo: ModoValidacao): string {
  switch (modo) {
    case ModoValidacao.PRESENCIAL:
      return "Vi no local";
    case ModoValidacao.PELA_FOTO:
      return "Pela foto";
  }
}

/**
 * Espelha `StatusHistorico` do backend (ETI-71): como um anúncio em estado
 * final aparece no histórico. Não é status persistido: "cancelado" e
 * "expirado" são ambos `ENCERRADO`, separados pela causa. Abas da tela 44.
 */
export const StatusHistorico = {
  CONCLUIDO: "CONCLUIDO",
  CANCELADO: "CANCELADO",
  EXPIRADO: "EXPIRADO",
} as const;

export type StatusHistorico = (typeof StatusHistorico)[keyof typeof StatusHistorico];

export const OPCOES_STATUS_HISTORICO: readonly StatusHistorico[] = [
  StatusHistorico.CONCLUIDO,
  StatusHistorico.CANCELADO,
  StatusHistorico.EXPIRADO,
];

/** Rótulo da aba da tela 44. */
export function rotuloAbaHistorico(status: StatusHistorico): string {
  switch (status) {
    case StatusHistorico.CONCLUIDO:
      return "Concluídos";
    case StatusHistorico.CANCELADO:
      return "Cancelados";
    case StatusHistorico.EXPIRADO:
      return "Expirados";
  }
}

/** Período da tela 44: atalhos contados a partir de hoje ou datas digitadas. */
export const PeriodoHistorico = {
  TRES_MESES: "TRES_MESES",
  SEIS_MESES: "SEIS_MESES",
  DOZE_MESES: "DOZE_MESES",
  PERSONALIZADO: "PERSONALIZADO",
} as const;

export type PeriodoHistorico = (typeof PeriodoHistorico)[keyof typeof PeriodoHistorico];

export const OPCOES_PERIODO_HISTORICO: readonly PeriodoHistorico[] = [
  PeriodoHistorico.TRES_MESES,
  PeriodoHistorico.SEIS_MESES,
  PeriodoHistorico.DOZE_MESES,
  PeriodoHistorico.PERSONALIZADO,
];

/** "Últimos 3 meses"... */
export function rotuloPeriodoHistorico(periodo: PeriodoHistorico): string {
  switch (periodo) {
    case PeriodoHistorico.TRES_MESES:
      return "Últimos 3 meses";
    case PeriodoHistorico.SEIS_MESES:
      return "Últimos 6 meses";
    case PeriodoHistorico.DOZE_MESES:
      return "Últimos 12 meses";
    case PeriodoHistorico.PERSONALIZADO:
      return "Personalizado";
  }
}

/**
 * Espelha `StatusReagendamento` do backend (ETI-99, limio-api#49). `PENDENTE`
 * é o único estado aberto; os outros são finais.
 */
export const StatusReagendamento = {
  PENDENTE: "PENDENTE",
  ACEITO: "ACEITO",
  RECUSADO: "RECUSADO",
  /** O próprio proponente desistiu antes da resposta. */
  CANCELADO: "CANCELADO",
  /** O prazo de resposta terminou sem manifestação. */
  EXPIRADO: "EXPIRADO",
  /** O serviço deixou de estar combinado (iniciado, cancelado...) com a proposta pendente. */
  SEM_EFEITO: "SEM_EFEITO",
} as const;

export type StatusReagendamento = (typeof StatusReagendamento)[keyof typeof StatusReagendamento];

/** Espelha `DecisaoReagendamento` do backend (ETI-99): resposta da contraparte na tela 41. */
export const DecisaoReagendamento = {
  ACEITAR: "ACEITAR",
  RECUSAR: "RECUSAR",
} as const;

export type DecisaoReagendamento = (typeof DecisaoReagendamento)[keyof typeof DecisaoReagendamento];
