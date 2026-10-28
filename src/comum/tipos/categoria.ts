import { z } from "zod";

/**
 * Espelha `CategoriaResponse` do backend (`GET /categorias`). `grupo` é o
 * cabeçalho sob o qual a categoria aparece nas listas de escolha
 * (Especialidades do Prestador e Categoria do anúncio).
 */
export const CategoriaSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  grupo: z.string(),
});

export type Categoria = z.infer<typeof CategoriaSchema>;
