import { z } from "zod";

import { Uf } from "./localidade";

/** Tamanhos máximos dos campos de endereço no backend (`EnderecoSalvoRequest`). */
export const APELIDO_MAX = 60;
export const RUA_MAX = 255;
export const NUMERO_MAX = 20;
export const COMPLEMENTO_MAX = 100;
export const BAIRRO_MAX = 100;
export const CIDADE_MAX = 100;

/** CEP só com dígitos, como a API guarda. */
export const CEP_REGEX = /^\d{8}$/;

/**
 * Espelha `EnderecoSalvoResponse` do backend — itens do `GET` e resposta do
 * `POST`, `PUT` e `PATCH .../padrao` de `/conta/perfil-empregador/enderecos`.
 * A API também devolve `latitude` e `longitude`; ficam de fora porque o app
 * não usa, e um valor inesperado nelas derrubaria o `parse` da lista inteira.
 */
export const EnderecoSalvoResponseSchema = z.object({
  id: z.uuid(),
  apelido: z.string(),
  cep: z.string(),
  rua: z.string(),
  numero: z.string(),
  complemento: z.string().nullable(),
  bairroRegiao: z.string(),
  cidade: z.string(),
  uf: z.enum(Uf),
  isPadrao: z.boolean(),
});

export type EnderecoSalvoResponse = z.infer<typeof EnderecoSalvoResponseSchema>;

/**
 * Campos de um endereço no corpo das requisições: os do `EnderecoSalvoRequest`
 * sem apelido nem padrão. É também o endereço avulso do anúncio.
 */
export const CamposEnderecoRequestSchema = z.object({
  cep: z.string().regex(CEP_REGEX),
  rua: z.string().trim().min(1).max(RUA_MAX),
  numero: z.string().trim().min(1).max(NUMERO_MAX),
  complemento: z.string().trim().max(COMPLEMENTO_MAX).nullable(),
  bairroRegiao: z.string().trim().min(1).max(BAIRRO_MAX),
  cidade: z.string().trim().min(1).max(CIDADE_MAX),
  uf: z.enum(Uf),
});

export type CamposEnderecoRequest = z.infer<typeof CamposEnderecoRequestSchema>;

/**
 * Espelha `EnderecoSalvoRequest` do backend — corpo do `POST` e do `PUT` (estado
 * completo). Cadastrar fica no `comum` porque o anúncio também salva endereço
 * ("Salvar este endereço para depois", tela 15b).
 */
export const EnderecoSalvoRequestSchema = z.object({
  apelido: z.string().trim().min(1).max(APELIDO_MAX),
  ...CamposEnderecoRequestSchema.shape,
  isPadrao: z.boolean(),
});

export type EnderecoSalvoRequest = z.infer<typeof EnderecoSalvoRequestSchema>;

/**
 * Campos de endereço nos formulários ("Novo endereço" e endereço avulso do
 * anúncio). Obrigatoriedade igual à da API: só o complemento é opcional.
 * Cidade e UF vêm juntas do seletor do IBGE.
 */
export const CamposEnderecoFormSchema = z.object({
  cep: z
    .string()
    .transform((valor) => valor.replace(/\D/g, ""))
    .pipe(z.string().regex(CEP_REGEX, "CEP inválido — use 00000-000")),
  cidade: z.string().trim().min(1, "Escolha a cidade").max(CIDADE_MAX),
  // Começa `null` no formulário novo; a saída validada sempre tem a UF.
  uf: z
    .enum(Uf)
    .nullable()
    .pipe(z.enum(Uf, { error: "Escolha a cidade" })),
  rua: z
    .string()
    .trim()
    .min(1, "Informe a rua")
    .max(RUA_MAX, `Use no máximo ${RUA_MAX} caracteres`),
  numero: z
    .string()
    .trim()
    .min(1, "Informe o número (ou S/N)")
    .max(NUMERO_MAX, `Use no máximo ${NUMERO_MAX} caracteres`),
  complemento: z
    .string()
    .trim()
    .max(COMPLEMENTO_MAX, `Use no máximo ${COMPLEMENTO_MAX} caracteres`),
  bairro: z
    .string()
    .trim()
    .min(1, "Informe o bairro")
    .max(BAIRRO_MAX, `Use no máximo ${BAIRRO_MAX} caracteres`),
});

/** Valores digitados (antes do `transform` do CEP). */
export type CamposEnderecoFormEntrada = z.input<typeof CamposEnderecoFormSchema>;
/** Valores já validados. */
export type CamposEnderecoForm = z.output<typeof CamposEnderecoFormSchema>;
