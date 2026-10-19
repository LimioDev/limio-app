import { z } from "zod";

import {
  CELULAR_REGEX,
  mesmoEmail,
  somenteDigitos,
} from "../servico/perfil.helpers";

/** `PerfilEmpregador.NOME_EXIBICAO_MAX` no backend (provisório, pendência do PO). */
export const NOME_EXIBICAO_MAX = 80;

/**
 * Espelha `PerfilEmpregadorResponse` do backend — resposta de
 * `GET /conta/perfil-empregador` e do `PATCH` do nome de exibição.
 * `mediaAvaliacoes` é `null` enquanto não há avaliação (nunca 0,0).
 */
export const PerfilEmpregadorResponseSchema = z.object({
  nomeExibicao: z.string(),
  mediaAvaliacoes: z.number().nullable(),
  qtdAvaliacoes: z.number().int(),
  email: z.string(),
  telefone: z.string().nullable(),
  emailConfirmadoEm: z.string().nullable(),
  telefoneConfirmadoEm: z.string().nullable(),
});

export type PerfilEmpregadorResponse = z.infer<
  typeof PerfilEmpregadorResponseSchema
>;

/** Espelha `ContatoResponse` do backend — resposta de `PATCH /auth/email` e `/auth/telefone`. */
export const ContatoResponseSchema = z.object({
  email: z.string(),
  telefone: z.string().nullable(),
  emailConfirmadoEm: z.string().nullable(),
  telefoneConfirmadoEm: z.string().nullable(),
});

export type ContatoResponse = z.infer<typeof ContatoResponseSchema>;

/** Espelha `EditarNomeExibicaoRequest` do backend. */
export const EditarNomeExibicaoRequestSchema = z.object({
  nomeExibicao: z.string().trim().min(1).max(NOME_EXIBICAO_MAX),
});

/** Espelha `TrocarEmailRequest` do backend. */
export const TrocarEmailRequestSchema = z.object({
  novoEmail: z.email(),
  senhaAtual: z.string().min(1),
});

export type TrocarEmailRequest = z.infer<typeof TrocarEmailRequestSchema>;

/** Espelha `TrocarTelefoneRequest` do backend — telefone só com dígitos. */
export const TrocarTelefoneRequestSchema = z.object({
  novoTelefone: z.string().regex(CELULAR_REGEX),
  senhaAtual: z.string().min(1),
});

export type TrocarTelefoneRequest = z.infer<typeof TrocarTelefoneRequestSchema>;

/** Contato salvo hoje, pra saber o que o usuário mudou no formulário. */
export interface ContatoAtual {
  email: string;
  /** Dígitos nacionais (`11982544472`); vazio se a conta não tem telefone. */
  telefone: string;
}

/**
 * Formulário da tela "Dados de contato". Depende do contato atual: o telefone
 * só é validado se mudou (uma conta antiga com fixo consegue trocar o nome), e
 * a senha só é pedida quando e-mail ou telefone mudam (a API exige `senhaAtual`).
 */
export function criarDadosContatoFormSchema(atual: ContatoAtual) {
  return z
    .object({
      nomeExibicao: z
        .string()
        .trim()
        .min(1, "Informe o nome de exibição")
        .max(NOME_EXIBICAO_MAX, `Use no máximo ${NOME_EXIBICAO_MAX} caracteres`),
      email: z.string().trim().pipe(z.email("E-mail inválido")),
      telefone: z.string(),
      senhaAtual: z.string(),
    })
    .superRefine((dados, ctx) => {
      const telefone = somenteDigitos(dados.telefone);
      const telefoneMudou = telefone !== atual.telefone;
      if (telefoneMudou && !CELULAR_REGEX.test(telefone)) {
        ctx.addIssue({
          code: "custom",
          path: ["telefone"],
          message: "Celular inválido — DDD + 9 dígitos",
        });
      }
      const contatoMudou = telefoneMudou || !mesmoEmail(dados.email, atual.email);
      if (contatoMudou && dados.senhaAtual.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["senhaAtual"],
          message: "Informe sua senha atual",
        });
      }
    });
}

export type DadosContatoForm = z.infer<
  ReturnType<typeof criarDadosContatoFormSchema>
>;
