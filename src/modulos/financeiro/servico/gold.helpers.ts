import { formatarDataHora, paraFusoLocal } from "../../../comum/lib/datas";
import type { CartaoSalvo } from "../tipos/gold.types";

/** 2990 + "BRL" → "R$ 29,90". Moeda fora do padrão ISO cai no número puro. */
export function formatarPreco(centavos: number, moeda: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(
      centavos / 100,
    );
  } catch {
    return (centavos / 100).toFixed(2).replace(".", ",");
  }
}

/** `{bandeira: "VISA", ultimos4: "4419"}` → "Visa •••• 4419". */
export function rotuloCartao(cartao: CartaoSalvo): string {
  const bandeira = cartao.bandeira
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
  return `${bandeira} •••• ${cartao.ultimos4}`;
}

/**
 * "Cobrança todo dia 18". O ciclo começa na hora da assinatura, então o dia
 * da cobrança é o de hoje (fuso do sistema).
 */
export function textoDiaCobranca(agora: Date = new Date()): string {
  return `Cobrança todo dia ${paraFusoLocal(agora).getDate()}`;
}

/** "renova em 18/12": fim do ciclo pago. */
export function textoRenovacao(renovaEm: string): string {
  return `renova em ${formatarDataHora(renovaEm, "dd/MM")}`;
}
