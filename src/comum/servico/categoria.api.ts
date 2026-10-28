import { z } from "zod";

import { api } from "../lib/api";
import { CategoriaSchema, type Categoria } from "../tipos/categoria";

/** Categorias ativas, em ordem de exibição. Exige login, qualquer papel. */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get("/categorias");
  return z.array(CategoriaSchema).parse(data);
}
