/** Mesma regra de `TrocarTelefoneRequest` no backend: DDD + 9 dígitos começando por 9. */
export const CELULAR_REGEX = /^[1-9][1-9]9\d{8}$/;

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** A API devolve o telefone como `+55DDNNNNNNNNN`; o app trabalha com os dígitos nacionais. */
export function telefoneNacional(telefoneApi: string): string {
  const digitos = somenteDigitos(telefoneApi);
  return digitos.length > 11 && digitos.startsWith("55")
    ? digitos.slice(2)
    : digitos;
}

/** "11982544472" → "(11) 98254-4472". Fixo legado (10 dígitos) → "(11) 3254-4472". */
export function formatarTelefone(digitos: string): string {
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const corte = numero.length - 4;
  if (ddd.length < 2 || corte < 1) {
    return digitos;
  }
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

export function mesmoEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
