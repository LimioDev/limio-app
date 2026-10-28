import { z } from "zod";

import { APELIDO_MAX, CamposEnderecoFormSchema } from "../../../comum/tipos/endereco";

// `EnderecoSalvoRequest` e o apelido ficam em `comum/tipos/endereco`: o anúncio também cadastra.

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
