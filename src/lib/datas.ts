import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

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
