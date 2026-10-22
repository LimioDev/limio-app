import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Todo prazo do sistema conta em America/Sao_Paulo; a API devolve UTC.
const FUSO = "America/Sao_Paulo";

export function paraFusoLocal(dataUtc: string | Date): TZDate {
  return new TZDate(new Date(dataUtc), FUSO);
}

export function formatarDataHora(
  dataUtc: string | Date,
  padrao = "dd/MM/yyyy HH:mm",
): string {
  return format(paraFusoLocal(dataUtc), padrao);
}

/** "Segunda, 31 de agosto" — data por extenso curta do topo dos dashboards. */
export function formatarDiaPorExtenso(data: string | Date = new Date()): string {
  const texto = format(paraFusoLocal(data), "EEEE, d 'de' MMMM", { locale: ptBR })
    // "segunda-feira" → "segunda": o guia usa o nome curto do dia.
    .replace("-feira", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
