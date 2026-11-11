import axios from "axios";

import { RespostaViaCepSchema } from "../tipos/cep";
import { Uf } from "../tipos/localidade";

/**
 * API pública do ViaCEP. Instância própria, fora de `comum/lib/api`: não leva
 * o token do LIMIO nem passa pela renovação de sessão — mesmo padrão de
 * `comum/servico/ibge.api.ts`.
 */
// eslint-disable-next-line import/no-named-as-default-member -- axios expõe `create` tanto como default quanto named export
const viaCep = axios.create({
  baseURL: "https://viacep.com.br/ws",
  timeout: 15_000,
});

export interface EnderecoPorCep {
  rua: string;
  bairro: string;
  cidade: string;
  uf: Uf;
}

const UFS_VALIDAS = new Set<string>(Object.values(Uf));

/**
 * `cep` precisa ter exatamente 8 dígitos (sem máscara) — quem chama garante isso
 * antes de consultar. Devolve `null` quando o CEP não existe (`erro: true`) ou
 * quando a UF devolvida não é uma UF válida (resposta fora do formato esperado).
 */
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoPorCep | null> {
  const { data } = await viaCep.get(`/${cep}/json/`);
  const resposta = RespostaViaCepSchema.parse(data);
  if (resposta.erro || !resposta.uf || !UFS_VALIDAS.has(resposta.uf)) {
    return null;
  }
  return {
    rua: resposta.logradouro ?? "",
    bairro: resposta.bairro ?? "",
    cidade: resposta.localidade ?? "",
    uf: resposta.uf as Uf,
  };
}
