import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { paraFusoLocal } from "../../../comum/lib/datas";

/** "2026-08" → "AGOSTO 2026". Só o nome do mês, então não depende de fuso. */
export function formatarMesDaCota(anoMes: string): string {
  const [ano, mes] = anoMes.split("-").map(Number);
  return format(new Date(ano, mes - 1, 1), "MMMM yyyy", { locale: ptBR }).toUpperCase();
}

/** "Renova em 1º de setembro" e, com `comHora`, "Renova em 1º de setembro, 00:00". */
export function formatarRenovacao(renovaEm: string, comHora = false): string {
  const data = paraFusoLocal(renovaEm);
  const dia = data.getDate() === 1 ? "1º" : String(data.getDate());
  const mes = format(data, "MMMM", { locale: ptBR });
  const hora = comHora ? `, ${format(data, "HH:mm")}` : "";
  return `Renova em ${dia} de ${mes}${hora}`;
}

/** "2 de 4 escolhas usadas", texto da faixa e da tela 33. */
export function formatarEscolhasUsadas(usadas: number, teto: number): string {
  return `${usadas} de ${teto} escolhas usadas`;
}
