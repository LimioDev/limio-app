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
  conteudo: T[];
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
}

/** Schema de `PageResponse` do backend para um item; `pagina` começa em 0. */
export function respostaPaginadaSchema<T extends z.ZodType>(item: T) {
  return z.object({
    conteudo: z.array(item),
    pagina: z.number().int(),
    totalPaginas: z.number().int(),
    totalElementos: z.number().int(),
  });
}
