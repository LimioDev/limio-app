import { isAxiosError } from "axios";

import type { ErroResponse } from "../tipos/erros";

export function erroApi(erro: unknown): ErroResponse | null {
  if (isAxiosError(erro) && erro.response?.data?.codigo) {
    return erro.response.data as ErroResponse;
  }
  return null;
}

export function mensagemErroApi(erro: unknown, padrao: string): string {
  return erroApi(erro)?.mensagem ?? padrao;
}
