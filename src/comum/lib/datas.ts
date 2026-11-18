import { TZDate } from "@date-fns/tz";
import { differenceInCalendarDays, format } from "date-fns";
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

/**
 * "03/09/2026" + "14:00" digitados → instante (em UTC por baixo), lidos no fuso
 * do sistema. `null` se a data ou a hora não existem (31/02, 25:00) ou não
 * estão nesse formato.
 */
export function deDataHoraLocal(data: string, hora: string): Date | null {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  const h = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!d || !h) {
    return null;
  }
  const [dia, mes, ano] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [horas, minutos] = [Number(h[1]), Number(h[2])];
  if (horas > 23 || minutos > 59) {
    return null;
  }
  const local = new TZDate(ano, mes - 1, dia, horas, minutos, FUSO);
  // O `Date` "corrige" 31/02 pra 03/03: confere se o dia continua o mesmo.
  if (local.getFullYear() !== ano || local.getMonth() !== mes - 1 || local.getDate() !== dia) {
    return null;
  }
  return new Date(local.getTime());
}

/** "Segunda, 31 de agosto" — data por extenso curta do topo dos dashboards. */
export function formatarDiaPorExtenso(data: string | Date = new Date()): string {
  const texto = format(paraFusoLocal(data), "EEEE, d 'de' MMMM", { locale: ptBR })
    // "segunda-feira" → "segunda": o guia usa o nome curto do dia.
    .replace("-feira", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Chave do dia no fuso do sistema ("2026-11-16"), para agrupar itens por dia (chat, notificações). */
export function chaveDia(dataUtc: string): string {
  return format(paraFusoLocal(dataUtc), "yyyy-MM-dd");
}

/** Separador de dia: "Hoje", "Ontem", "2 de novembro" ou "2 de novembro de 2025" em outro ano. */
export function rotuloDia(dataUtc: string, agora: Date = new Date()): string {
  const dia = paraFusoLocal(dataUtc);
  const hoje = paraFusoLocal(agora);
  const diferenca = differenceInCalendarDays(hoje, dia);
  if (diferenca === 0) {
    return "Hoje";
  }
  if (diferenca === 1) {
    return "Ontem";
  }
  const padrao = dia.getFullYear() === hoje.getFullYear() ? "d 'de' MMMM" : "d 'de' MMMM 'de' yyyy";
  return format(dia, padrao, { locale: ptBR });
}
