import { z } from "zod";

import {
  CamposEnderecoFormSchema,
  CamposEnderecoRequestSchema,
} from "../../../comum/tipos/endereco";

/** Tamanho máximo do apelido em `EnderecoSalvoRequest` no backend. */
export const APELIDO_MAX = 60;

/** Espelha `EnderecoSalvoRequest` do backend — corpo do `POST` e do `PUT` (estado completo). */
export const EnderecoSalvoRequestSchema = z.object({
  apelido: z.string().trim().min(1).max(APELIDO_MAX),
  ...CamposEnderecoRequestSchema.shape,
  isPadrao: z.boolean(),
});

export type EnderecoSalvoRequest = z.infer<typeof EnderecoSalvoRequestSchema>;

/** Formulário da tela "Novo endereço": os campos de endereço, mais apelido e padrão. */
export const EnderecoFormSchema = z.object({
  apelido: z
    .string()
    .trim()
    .min(1, "Informe um apelido, como Casa ou Escritório")
    .max(APELIDO_MAX, `Use no máximo ${APELIDO_MAX} caracteres`),
  ...CamposEnderecoFormSchema.shape,
  isPadrao: z.boolean(),
});

/** Valores digitados (antes do `transform` do CEP). */
export type EnderecoFormEntrada = z.input<typeof EnderecoFormSchema>;
/** Valores já validados. */
export type EnderecoForm = z.output<typeof EnderecoFormSchema>;

export type CampoEnderecoForm = keyof EnderecoFormEntrada;
