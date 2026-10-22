import { isAxiosError } from "axios";

import { ErroResponseSchema, type ErroResponse } from "../tipos/erros";
import { ConflitoDeEstado } from "./api";

/** Converte a resposta de erro da API em `ErroResponse`; `null` se não vier nesse formato (ex.: sem rede). */
export function erroApi(erro: unknown): ErroResponse | null {
  // O interceptor embrulha o 409; o corpo da API fica no erro original.
  const original = erro instanceof ConflitoDeEstado ? erro.cause : erro;
  if (!isAxiosError(original)) {
    return null;
  }
  const resultado = ErroResponseSchema.safeParse(original.response?.data);
  return resultado.success ? resultado.data : null;
}

export function mensagemErroApi(erro: unknown, padrao: string): string {
  return erroApi(erro)?.mensagem ?? padrao;
}
