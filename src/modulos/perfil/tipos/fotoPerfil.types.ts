import { z } from "zod";

/**
 * Espelha `FotoPerfilResponse` do backend — resposta de `GET` e `PUT
 * /conta/foto-perfil`. `url` é um link temporário (bucket privado): vale até
 * `expiraEm`; depois o app consulta de novo. Nunca guardar como permanente.
 *
 * Tipo, tamanho e preparo do arquivo enviado ficam em `comum/tipos/foto` e
 * `comum/lib/foto`: as fotos do anúncio seguem a mesma regra.
 */
export const FotoPerfilResponseSchema = z.object({
  url: z.url(),
  expiraEm: z.string(),
});

export type FotoPerfilResponse = z.infer<typeof FotoPerfilResponseSchema>;
