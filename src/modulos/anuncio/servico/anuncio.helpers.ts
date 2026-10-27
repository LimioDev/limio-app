import { format } from "date-fns";

import { paraFusoLocal } from "../../../comum/lib/datas";

// O rótulo do protótipo ("Qua") não bate com o `EEE` do ptBR ("qua.").
const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const formatoDistancia = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** "Qua, 03/09". */
export function diaComData(dataHoraUtc: string): string {
  const data = paraFusoLocal(dataHoraUtc);
  return `${DIAS_SEMANA_CURTOS[data.getDay()]}, ${format(data, "dd/MM")}`;
}

/** "Qua, 03/09 · 14h" (ou "14h30") — data e hora pretendidas nos cartões. */
export function quandoCurto(dataHoraUtc: string): string {
  const data = paraFusoLocal(dataHoraUtc);
  const hora = data.getMinutes() === 0 ? format(data, "H'h'") : format(data, "H'h'mm");
  return `${diaComData(dataHoraUtc)} · ${hora}`;
}

/** "14:00". */
export function horaPretendida(dataHoraUtc: string): string {
  return format(paraFusoLocal(dataHoraUtc), "HH:mm");
}

/** "1,8 km". */
export function formatarDistancia(km: number): string {
  return `${formatoDistancia.format(km)} km`;
}
