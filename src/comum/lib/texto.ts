/** Busca sem diferenciar maiúsculas nem acentos ("eletrica" acha "Elétrica"). */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize("NFD")
    // Remove os acentos que o NFD separou da letra (faixa dos diacríticos combinantes).
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
