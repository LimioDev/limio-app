import { z } from "zod";

import { PapelUsuario } from "./papel";

/**
 * Espelha `LoginResponse` do backend — mesmo formato no login e na renovação
 * (`POST /auth/refresh`), por isso fica em `comum/`: o `api.ts` também valida.
 */
export const TokensSessaoSchema = z.object({
  token: z.string().min(1),
  expiraEm: z.string(),
  papel: z.enum(PapelUsuario),
  refreshToken: z.string().min(1),
});

export type TokensSessao = z.infer<typeof TokensSessaoSchema>;
