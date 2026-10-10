import { z } from "zod";

/** Espelha 1:1 `CodigoErro` do backend (`comum/excecao/enums/CodigoErro.java`). */
export const CodigoErro = {
  VALIDACAO_FALHOU: "VALIDACAO_FALHOU",
  REQUISICAO_INVALIDA: "REQUISICAO_INVALIDA",
  CADASTRO_IDADE_MINIMA: "CADASTRO_IDADE_MINIMA",
  CADASTRO_CPF_INVALIDO: "CADASTRO_CPF_INVALIDO",
  CADASTRO_DADOS_INDISPONIVEIS: "CADASTRO_DADOS_INDISPONIVEIS",
  CREDENCIAIS_INVALIDAS: "CREDENCIAIS_INVALIDAS",
  LOGIN_TEMPORARIAMENTE_BLOQUEADO: "LOGIN_TEMPORARIAMENTE_BLOQUEADO",
  CONTA_SUSPENSA: "CONTA_SUSPENSA",
  NAO_AUTENTICADO: "NAO_AUTENTICADO",
  ACESSO_NEGADO: "ACESSO_NEGADO",
  SESSAO_INVALIDA: "SESSAO_INVALIDA",
  PAPEL_INVALIDO: "PAPEL_INVALIDO",
  ENTIDADE_NAO_ENCONTRADA: "ENTIDADE_NAO_ENCONTRADA",
  ERRO_INTERNO: "ERRO_INTERNO",
} as const;

export type CodigoErro = (typeof CodigoErro)[keyof typeof CodigoErro];

export const ErroResponseSchema = z.object({
  codigo: z.enum(CodigoErro),
  mensagem: z.string(),
  timestamp: z.string(),
  path: z.string(),
});

export type ErroResponse = z.infer<typeof ErroResponseSchema>;
