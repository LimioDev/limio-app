import { addDays, isSameDay } from "date-fns";

import { formatarDataHora, paraFusoLocal } from "../../../comum/lib/datas";
import { JANELA_AVALIACAO_DIAS } from "../tipos/avaliacao.types";

export const MENSAGEM_JA_AVALIADO = "Você já avaliou este serviço.";
export const MENSAGEM_PRAZO_ENCERRADO = "O prazo para avaliar terminou.";

const ROTULOS_NOTA = ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"] as const;

/** 5 → "Excelente". */
export function rotuloNota(nota: number): string {
  return ROTULOS_NOTA[nota - 1] ?? "";
}

/** "Rafael Souza" → "Rafael". */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/** "concluído hoje" ou "concluído em 06/09". */
export function textoConcluido(concluidoEm: string, agora = new Date()): string {
  return isSameDay(paraFusoLocal(concluidoEm), paraFusoLocal(agora))
    ? "concluído hoje"
    : `concluído em ${formatarDataHora(concluidoEm, "dd/MM")}`;
}

/**
 * Por que `podeAvaliar` veio `false`. A consulta não diz o motivo; como só
 * existem dois (janela de 7 dias ou já avaliado), a data de conclusão decide.
 */
export function motivoSemAvaliacao(concluidoEm: string, agora = new Date()): string {
  const fimJanela = addDays(new Date(concluidoEm), JANELA_AVALIACAO_DIAS);
  return agora >= fimJanela ? MENSAGEM_PRAZO_ENCERRADO : MENSAGEM_JA_AVALIADO;
}
