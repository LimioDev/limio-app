import { isAxiosError } from "axios";

import { ErroResponseSchema, type ErroResponse } from "../tipos/erros";

/** Converte a resposta de erro da API em `ErroResponse`; `null` se não vier nesse formato (ex.: sem rede). */
export function erroApi(erro: unknown): ErroResponse | null {
  if (!isAxiosError(erro)) {
    return null;
  }
  const resultado = ErroResponseSchema.safeParse(erro.response?.data);
  return resultado.success ? resultado.data : null;
}

export function mensagemErroApi(erro: unknown, padrao: string): string {
  return erroApi(erro)?.mensagem ?? padrao;
}
