import { z } from "zod";

/**
 * Resposta do ViaCEP (`/ws/{cep}/json/`). CEP inexistente devolve só `{ "erro": true }`
 * — por isso todo campo é opcional aqui; `buscarEnderecoPorCep` (servico/cep.api.ts)
 * decide o que fazer com `erro`, não este schema.
 */
export const RespostaViaCepSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.boolean().optional(),
});

export type RespostaViaCep = z.infer<typeof RespostaViaCepSchema>;
