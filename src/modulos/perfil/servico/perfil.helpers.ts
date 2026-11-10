/** Mesma regra de `TrocarTelefoneRequest` no backend: DDD + 9 dígitos começando por 9. */
export const CELULAR_REGEX = /^[1-9][1-9]9\d{8}$/;

export function mesmoEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
