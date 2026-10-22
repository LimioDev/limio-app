import axios from "axios";
import { z } from "zod";

import { MunicipioIbgeSchema, type MunicipioIbge } from "../tipos/atuacao.types";
import type { Uf } from "../tipos/perfil.enums";

/**
 * API pública de localidades do IBGE. Instância própria, fora de `comum/lib/api`:
 * não leva o token do LIMIO nem passa pela renovação de sessão.
 *
 * A lista vem do IBGE porque a API do LIMIO recebe só o nome e a UF e
 * geocodifica pelo Nominatim, que não pode ser usado pra autocompletar.
 * O nome oficial evita `MUNICIPIO_NAO_ENCONTRADO` ao salvar.
 */
// eslint-disable-next-line import/no-named-as-default-member -- axios expõe `create` tanto como default quanto named export
const ibge = axios.create({
  baseURL: "https://servicodados.ibge.gov.br/api/v1/localidades",
  timeout: 15_000,
});

export async function listarMunicipios(uf: Uf): Promise<MunicipioIbge[]> {
  const { data } = await ibge.get(`/estados/${uf}/municipios`, {
    params: { orderBy: "nome" },
  });
  return z.array(MunicipioIbgeSchema).parse(data);
}
