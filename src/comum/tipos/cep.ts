import { z } from "zod";

/**
 * Resposta do ViaCEP (`/ws/{cep}/json/`). CEP inexistente devolve `{ "erro": "true" }`
 * — string, não boolean (testado contra a API real) — por isso todo campo é opcional
 * aqui; `buscarEnderecoPorCep` (servico/cep.api.ts) decide o que fazer com `erro`, não
 * este schema. Aceita os dois formatos porque `"true"` (string) é truthy em JS, então
 * o `if (resposta.erro)` de quem consome continua funcionando sem mudança.
 */
export const RespostaViaCepSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.union([z.boolean(), z.literal("true")]).optional(),
});

export type RespostaViaCep = z.infer<typeof RespostaViaCepSchema>;
