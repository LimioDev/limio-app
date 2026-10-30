import { z } from "zod";

export type Estado =
  | "aguardando"
  | "combinado"
  | "andamento"
  | "validacao"
  | "contestacao"
  | "concluido"
  | "cancelado"
  | "expirado";

export interface RespostaPaginada<T> {
  content: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

/**
 * Schema de `PageResponse` do backend (`comum/records/PageResponse.java`) para
 * um item; `pagina` começa em 0 e `totalElementos` é o total do filtro inteiro.
 */
export function respostaPaginadaSchema<T extends z.ZodType>(item: T) {
  return z.object({
    content: z.array(item),
    pagina: z.number().int(),
    tamanho: z.number().int(),
    totalElementos: z.number().int(),
    totalPaginas: z.number().int(),
  });
}
