import { z } from "zod";

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

/** Município da API de localidades do IBGE (`/estados/{UF}/municipios`). */
export const MunicipioIbgeSchema = z.object({
  id: z.number(),
  nome: z.string(),
});

export type MunicipioIbge = z.infer<typeof MunicipioIbgeSchema>;

/** Município escolhido num seletor: o nome como o IBGE escreve, com a UF. */
export interface MunicipioEscolhido {
  nome: string;
  uf: Uf;
}

/** "São Paulo · SP" — mesmo formato do campo "Cidade e UF" do cadastro. */
export function rotuloMunicipio(nome: string, uf: Uf): string {
  return `${nome} · ${uf}`;
}
