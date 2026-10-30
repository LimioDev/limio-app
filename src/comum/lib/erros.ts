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

/**
 * O `VALIDACAO_FALHOU` da API traz os campos na mensagem, no formato
 * `"cep: CEP deve ter 8 dígitos; rua: rua é obrigatória"`. Separa por campo
 * do formulário, pelo mapa "nome na API → campo"; o que não reconhecer fica
 * de fora (a tela mostra a mensagem inteira se nada for reconhecido).
 */
export function errosPorCampo<Campo extends string>(
  mensagem: string,
  campoDaApi: Readonly<Record<string, Campo>>,
): Partial<Record<Campo, string>> {
  const erros: Partial<Record<Campo, string>> = {};
  for (const trecho of mensagem.split(";")) {
    const separador = trecho.indexOf(":");
    if (separador < 0) {
      continue;
    }
    const campo = campoDaApi[trecho.slice(0, separador).trim()];
    const texto = trecho.slice(separador + 1).trim();
    if (campo && texto && !erros[campo]) {
      erros[campo] = texto.charAt(0).toUpperCase() + texto.slice(1);
    }
  }
  return erros;
}
