import { isSameDay } from "date-fns";

import { formatarDataHora, paraFusoLocal } from "../../../comum/lib/datas";
import { NOME_CONTA_ENCERRADA, type AvaliacaoPendenteResponse } from "../tipos/avaliacao.types";

export const MENSAGEM_JA_AVALIADO = "Você já avaliou este serviço.";
export const MENSAGEM_PRAZO_ENCERRADO = "O prazo para avaliar terminou.";
export const MENSAGEM_NAO_CONCLUIDO = "O serviço ainda não foi concluído.";

const ROTULOS_NOTA = ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"] as const;

/** 5 → "Excelente". */
export function rotuloNota(nota: number): string {
  return ROTULOS_NOTA[nota - 1] ?? "";
}

/** "Rafael Souza" → "Rafael". */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/**
 * Nome da outra parte na tela: só o primeiro, menos na conta encerrada, que
 * fica inteiro ("Como foi com Usuário excluído?", não "com Usuário?").
 */
export function nomeExibido(nome: string): string {
  return nome === NOME_CONTA_ENCERRADA ? nome : primeiroNome(nome);
}

/** "concluído hoje" ou "concluído em 06/09". */
export function textoConcluido(concluidoEm: string, agora = new Date()): string {
  return isSameDay(paraFusoLocal(concluidoEm), paraFusoLocal(agora))
    ? "concluído hoje"
    : `concluído em ${formatarDataHora(concluidoEm, "dd/MM")}`;
}

/**
 * Por que `podeAvaliar` veio `false`. A consulta não diz o motivo, mas
 * `avaliarAte` decide: `null` é serviço não concluído; já passado é prazo
 * encerrado; senão, quem consulta já avaliou.
 */
export function motivoSemAvaliacao(
  { avaliarAte }: Pick<AvaliacaoPendenteResponse, "avaliarAte">,
  agora = new Date(),
): string {
  if (avaliarAte === null) {
    return MENSAGEM_NAO_CONCLUIDO;
  }
  return agora >= new Date(avaliarAte) ? MENSAGEM_PRAZO_ENCERRADO : MENSAGEM_JA_AVALIADO;
}
