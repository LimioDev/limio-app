export const CodigoErro = {
  VALIDACAO_FALHOU: "VALIDACAO_FALHOU",
  CADASTRO_IDADE_MINIMA: "CADASTRO_IDADE_MINIMA",
  CADASTRO_CPF_INVALIDO: "CADASTRO_CPF_INVALIDO",
  CADASTRO_DADOS_INDISPONIVEIS: "CADASTRO_DADOS_INDISPONIVEIS",
  ENTIDADE_NAO_ENCONTRADA: "ENTIDADE_NAO_ENCONTRADA",
  ERRO_INTERNO: "ERRO_INTERNO",
} as const;

export type CodigoErro = (typeof CodigoErro)[keyof typeof CodigoErro];

export interface ErroResponse {
  codigo: CodigoErro;
  mensagem: string;
  timestamp: string;
  path: string;
}
