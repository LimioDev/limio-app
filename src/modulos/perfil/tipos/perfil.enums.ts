/** Espelha `DiaSemana` do backend. A ordem das chaves (segunda primeiro) é a ordem de exibição. */
export const DiaSemana = {
  SEGUNDA: "SEGUNDA",
  TERCA: "TERCA",
  QUARTA: "QUARTA",
  QUINTA: "QUINTA",
  SEXTA: "SEXTA",
  SABADO: "SABADO",
  DOMINGO: "DOMINGO",
} as const;

export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana];

export const DIAS_SEMANA: readonly DiaSemana[] = Object.values(DiaSemana);

export function rotuloDia(dia: DiaSemana): string {
  switch (dia) {
    case DiaSemana.SEGUNDA:
      return "Segunda";
    case DiaSemana.TERCA:
      return "Terça";
    case DiaSemana.QUARTA:
      return "Quarta";
    case DiaSemana.QUINTA:
      return "Quinta";
    case DiaSemana.SEXTA:
      return "Sexta";
    case DiaSemana.SABADO:
      return "Sábado";
    case DiaSemana.DOMINGO:
      return "Domingo";
  }
}

/** Abreviação usada em faixas de dias ("Seg a Sex"). */
export function rotuloDiaCurto(dia: DiaSemana): string {
  switch (dia) {
    case DiaSemana.SEGUNDA:
      return "Seg";
    case DiaSemana.TERCA:
      return "Ter";
    case DiaSemana.QUARTA:
      return "Qua";
    case DiaSemana.QUINTA:
      return "Qui";
    case DiaSemana.SEXTA:
      return "Sex";
    case DiaSemana.SABADO:
      return "Sáb";
    case DiaSemana.DOMINGO:
      return "Dom";
  }
}

