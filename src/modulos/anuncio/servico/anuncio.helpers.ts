import { format } from "date-fns";

import { paraFusoLocal } from "../../../comum/lib/datas";
import type { Estado } from "../../../comum/tipos/api";
import { StatusAnuncio } from "../tipos/anuncio.enums";

// Os rótulos do protótipo ("Qua") não batem com o `EEE` do ptBR ("qua.").
const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Qua, 03/09 · 14h" (ou "14h30"), no fuso do sistema. */
export function quandoCurto(dataHoraUtc: string): string {
  const data = paraFusoLocal(dataHoraUtc);
  const hora = data.getMinutes() === 0 ? format(data, "HH'h'") : format(data, "HH'h'mm");
  return `${DIAS_SEMANA_CURTOS[data.getDay()]}, ${format(data, "dd/MM")} · ${hora}`;
}

/** Selo do anúncio. `PUBLICADO` com prestador escolhido é o "Combinado" do protótipo. */
export function estadoDoAnuncio(status: StatusAnuncio, temPrestadorEscolhido: boolean): Estado {
  switch (status) {
    case StatusAnuncio.PUBLICADO:
      return temPrestadorEscolhido ? "combinado" : "aguardando";
    case StatusAnuncio.EM_ANDAMENTO:
      return "andamento";
    case StatusAnuncio.AGUARDANDO_VALIDACAO:
      return "validacao";
    case StatusAnuncio.CONCLUIDO:
      return "concluido";
    case StatusAnuncio.ENCERRADO:
      return "cancelado";
  }
}
