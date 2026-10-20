import { z } from "zod";

/**
 * Espelha `PreferenciaNotificacao` do backend (contrato do ETI-34): os quatro
 * canais são booleanos obrigatórios, tanto na resposta quanto no corpo da
 * atualização. O app não tem padrão próprio — mostra o que a API devolve.
 */
export const PreferenciasNotificacaoSchema = z.object({
  push: z.boolean(),
  email: z.boolean(),
  sms: z.boolean(),
  whatsapp: z.boolean(),
});

export type PreferenciasNotificacao = z.infer<
  typeof PreferenciasNotificacaoSchema
>;
