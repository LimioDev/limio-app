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

/** Espelha `Uf` do backend: as 27 unidades federativas oficiais, por sigla. */
export const Uf = {
  AC: "AC",
  AL: "AL",
  AP: "AP",
  AM: "AM",
  BA: "BA",
  CE: "CE",
  DF: "DF",
  ES: "ES",
  GO: "GO",
  MA: "MA",
  MT: "MT",
  MS: "MS",
  MG: "MG",
  PA: "PA",
  PB: "PB",
  PR: "PR",
  PE: "PE",
  PI: "PI",
  RJ: "RJ",
  RN: "RN",
  RS: "RS",
  RO: "RO",
  RR: "RR",
  SC: "SC",
  SP: "SP",
  SE: "SE",
  TO: "TO",
} as const;

export type Uf = (typeof Uf)[keyof typeof Uf];

/** Siglas em ordem alfabética, pra lista de escolha. */
export const UFS: readonly Uf[] = Object.values(Uf).sort();
