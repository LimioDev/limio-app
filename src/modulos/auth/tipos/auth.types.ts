import { z } from "zod";

import { PapelUsuario } from "../../../comum/tipos/papel";
import { cpfValido, dataBrValida, maiorDeIdade, somenteDigitos } from "../servico/auth.helpers";

/** Espelha `CadastroRequest` do backend — o que vai no corpo de `POST /auth/cadastro`. */
export const CadastroRequestSchema = z.object({
  nomeCompleto: z.string().min(1),
  email: z.email(),
  telefone: z.string().regex(/^\d{10,11}$/),
  senha: z.string().min(8),
  cpf: z.string().regex(/^\d{11}$/),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cidadeUf: z.string().min(1),
});

export type CadastroRequest = z.infer<typeof CadastroRequestSchema>;

/** Espelha `UsuarioResponse` do backend. */
export const UsuarioResponseSchema = z.object({
  id: z.uuid(),
  nomeCompleto: z.string(),
  email: z.string(),
  papelAtivo: z.enum(PapelUsuario),
  criadoEm: z.string(),
});

export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;

/** Espelha `LoginRequest` do backend — corpo de `POST /auth/login`. */
export const LoginRequestSchema = z.object({
  email: z.email(),
  senha: z.string().min(1),
  dispositivo: z.string().max(255).optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/** Só os papéis alternáveis — `ADMIN` o backend recusa com `PAPEL_INVALIDO`. */
export const PapelAlternavelSchema = z.enum([
  PapelUsuario.EMPREGADOR,
  PapelUsuario.PRESTADOR,
]);

export type PapelAlternavel = z.infer<typeof PapelAlternavelSchema>;

/**
 * Espelha `PapelAtivoResponse` do backend — resposta de `PATCH /auth/papel-ativo`.
 * O endpoint só aceita papéis alternáveis, então a resposta também é um deles.
 */
export const PapelAtivoResponseSchema = z.object({
  papelAtivo: PapelAlternavelSchema,
});

export type PapelAtivoResponse = z.infer<typeof PapelAtivoResponseSchema>;

/** Espelha `SolicitarRecuperacaoSenhaRequest` — corpo de `POST /auth/recuperar-senha`. */
export const RecuperarSenhaRequestSchema = z.object({
  email: z.email().max(255),
});

export type RecuperarSenhaRequest = z.infer<typeof RecuperarSenhaRequestSchema>;

/** Mesma regra do `@Pattern` dos records de senha no backend (72 é o limite do BCrypt). */
export const SENHA_TAMANHO_MINIMO = 8;
export const SENHA_TAMANHO_MAXIMO = 72;
export const TEM_LETRA = /[A-Za-z]/;
export const TEM_NUMERO = /\d/;

const NovaSenhaSchema = z
  .string()
  .min(SENHA_TAMANHO_MINIMO, "A senha precisa ter pelo menos 8 caracteres")
  .max(SENHA_TAMANHO_MAXIMO, "A senha pode ter no máximo 72 caracteres")
  .regex(TEM_LETRA, "A senha precisa ter uma letra")
  .regex(TEM_NUMERO, "A senha precisa ter um número");

/**
 * Espelha `AlterarSenhaRequest` — corpo de `PATCH /auth/senha`. O
 * `refreshToken` diz qual sessão é "este aparelho": ela recebe tokens novos e
 * as demais são encerradas.
 */
export const AlterarSenhaRequestSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: NovaSenhaSchema,
  refreshToken: z.string().min(1),
});

export type AlterarSenhaRequest = z.infer<typeof AlterarSenhaRequestSchema>;

/**
 * Espelha `RedefinirSenhaRequest` — corpo de `POST /auth/redefinir-senha`. O
 * `token` vem do link do e-mail (`limio://nova-senha?token=...`).
 */
export const RedefinirSenhaRequestSchema = z.object({
  token: z.string().min(1),
  novaSenha: NovaSenhaSchema,
});

export type RedefinirSenhaRequest = z.infer<typeof RedefinirSenhaRequestSchema>;

/** Valores do formulário da tela 06 "Redefinir sua senha". */
export const RecuperarSenhaFormSchema = z.object({
  email: z.string().trim().pipe(z.email("E-mail inválido")),
});

export type RecuperarSenhaForm = z.infer<typeof RecuperarSenhaFormSchema>;

/** "Repetir a nova senha" igual à nova — usado nos forms de alterar e de redefinir. */
const REPETICAO_CONFERE = {
  path: ["repetirNovaSenha"],
  message: "As senhas não conferem",
};

/** Valores do formulário da tela 07a "Alterar senha". */
export const AlterarSenhaFormSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual"),
    novaSenha: NovaSenhaSchema,
    repetirNovaSenha: z.string(),
  })
  .refine(
    (dados) => dados.repetirNovaSenha === dados.novaSenha,
    REPETICAO_CONFERE,
  );

export type AlterarSenhaForm = z.infer<typeof AlterarSenhaFormSchema>;

/** Valores do formulário da tela "Nova senha" (link do e-mail de recuperação). */
export const NovaSenhaFormSchema = z
  .object({
    novaSenha: NovaSenhaSchema,
    repetirNovaSenha: z.string(),
  })
  .refine(
    (dados) => dados.repetirNovaSenha === dados.novaSenha,
    REPETICAO_CONFERE,
  );

export type NovaSenhaForm = z.infer<typeof NovaSenhaFormSchema>;

/** Valores do formulário da tela 05 "Entrar". */
export const LoginFormSchema = z.object({
  email: z.string().trim().pipe(z.email("E-mail inválido")),
  senha: z.string().min(1, "Informe sua senha"),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;

/** Valores do formulário do passo 1 — texto mascarado como o usuário digita. */
export const DadosPessoaisFormSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe seu nome completo"),
  cpf: z
    .string()
    .refine((v) => somenteDigitos(v).length === 11, "CPF inválido")
    .refine((v) => cpfValido(v), "CPF inválido"),
  nascimento: z
    .string()
    .refine((v) => dataBrValida(v), "Data de nascimento inválida")
    .refine((v) => maiorDeIdade(v), "Você precisa ter 18 anos ou mais"),
  cidadeUf: z.string().trim().min(1, "Informe cidade e UF"),
  email: z.email("E-mail inválido"),
  celular: z
    .string()
    .refine((v) => {
      const d = somenteDigitos(v).length;
      return d === 10 || d === 11;
    }, "Celular inválido — DDD + número"),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export type DadosPessoaisForm = z.infer<typeof DadosPessoaisFormSchema>;
