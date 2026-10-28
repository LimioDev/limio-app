import { z } from "zod";

import { CategoriaSchema } from "../../../comum/tipos/categoria";
import { Uf } from "../../../comum/tipos/localidade";
import { DiaSemana } from "./perfil.enums";

/** Faixa de `PerfilAtuacaoRequest.raioAtendimentoKm` no backend. */
export const RAIO_MIN_KM = 1;
export const RAIO_MAX_KM = 40;
/** Raio sugerido pra quem nunca salvou o perfil (a API devolve `null`). */
export const RAIO_PADRAO_KM = 10;
export const MUNICIPIO_BASE_MAX = 100;

/** `HH:mm`, de 00:00 a 23:59 — formato da API nas janelas. */
export const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Espelha `JanelaAtendimentoRequest`/`Response` do backend. */
export const JanelaAtendimentoSchema = z.object({
  diaSemana: z.enum(DiaSemana),
  horaInicio: z.string().regex(HORA_REGEX),
  horaFim: z.string().regex(HORA_REGEX),
});

export type JanelaAtendimento = z.infer<typeof JanelaAtendimentoSchema>;

/**
 * Espelha `PerfilAtuacaoResponse` do backend — resposta do GET e do PUT de
 * `/perfil/prestador/atuacao`. Quem nunca salvou recebe raio, município e UF
 * nulos, listas vazias e `completo = false`. O app usa o `completo` da API,
 * nunca calcula.
 */
export const PerfilAtuacaoResponseSchema = z.object({
  especialidades: z.array(CategoriaSchema),
  raioAtendimentoKm: z.number().int().nullable(),
  municipioBase: z.string().nullable(),
  ufBase: z.enum(Uf).nullable(),
  janelas: z.array(JanelaAtendimentoSchema),
  completo: z.boolean(),
});

export type PerfilAtuacaoResponse = z.infer<typeof PerfilAtuacaoResponseSchema>;

/**
 * Espelha `PerfilAtuacaoRequest` do backend — corpo do PUT, estado completo.
 * Especialidades e janelas podem ir vazias. Mensagens em português porque o
 * mesmo schema valida o rascunho da tela antes de enviar.
 */
export const PerfilAtuacaoRequestSchema = z.object({
  especialidades: z.array(z.uuid()),
  raioAtendimentoKm: z
    .number()
    .int("O raio deve ser um número inteiro")
    .min(RAIO_MIN_KM, `O raio deve ser de ${RAIO_MIN_KM} a ${RAIO_MAX_KM} km`)
    .max(RAIO_MAX_KM, `O raio deve ser de ${RAIO_MIN_KM} a ${RAIO_MAX_KM} km`),
  municipioBase: z
    .string()
    .trim()
    .min(1, "Escolha o município-base")
    .max(MUNICIPIO_BASE_MAX),
  ufBase: z.enum(Uf, { error: "Escolha o município-base" }),
  janelas: z.array(
    JanelaAtendimentoSchema.refine((j) => j.horaInicio < j.horaFim, {
      message: "O início deve ser antes do fim",
      path: ["horaFim"],
    }),
  ),
});

export type PerfilAtuacaoRequest = z.infer<typeof PerfilAtuacaoRequestSchema>;

/** Uma linha do editor "Janelas de horário": um horário por dia. */
export const JanelaDiaFormSchema = z
  .object({
    diaSemana: z.enum(DiaSemana),
    ativo: z.boolean(),
    horaInicio: z.string(),
    horaFim: z.string(),
  })
  .superRefine((janela, ctx) => {
    if (!janela.ativo) {
      return;
    }
    const inicioValido = HORA_REGEX.test(janela.horaInicio);
    const fimValido = HORA_REGEX.test(janela.horaFim);
    if (!inicioValido) {
      ctx.addIssue({ code: "custom", path: ["horaInicio"], message: "Horário inválido" });
    }
    if (!fimValido) {
      ctx.addIssue({ code: "custom", path: ["horaFim"], message: "Horário inválido" });
    }
    if (inicioValido && fimValido && janela.horaInicio >= janela.horaFim) {
      ctx.addIssue({
        code: "custom",
        path: ["horaFim"],
        message: "O início deve ser antes do fim",
      });
    }
  });

export const JanelasFormSchema = z.object({
  dias: z.array(JanelaDiaFormSchema),
});

export type JanelasForm = z.infer<typeof JanelasFormSchema>;
