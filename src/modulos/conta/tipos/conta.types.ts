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

/**
 * Corpo de `POST /auth/encerrar-conta` (contrato do ETI-36). A confirmação
 * explícita é obrigatória: sem `true`, o backend recusa com 400.
 */
export const EncerrarContaRequestSchema = z.object({
  confirmacao: z.literal(true),
});

export type EncerrarContaRequest = z.infer<typeof EncerrarContaRequestSchema>;
