import { differenceInCalendarDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { paraFusoLocal } from "../../../comum/lib/datas";
import { MotivoSomenteLeitura, PapelNoChat } from "../tipos/chat.enums";

const SUFIXO_SOMENTE_LEITURA = "A conversa fica salva, mas não recebe novas mensagens.";

/** "Rafael Souza" → "Rafael", como o protótipo usa nos textos corridos. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}

/** "14:02", no fuso do sistema. */
export function horaMensagem(dataUtc: string): string {
  return format(paraFusoLocal(dataUtc), "HH:mm");
}

/** Chave do dia da mensagem no fuso do sistema, para agrupar os balões. */
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

/**
 * Faixa da tela 22 com o motivo do somente leitura. O protótipo (22 a 22e)
 * mostra o lado de quem sofreu a ação ("Marina recusou sua candidatura");
 * quem a fez vê o mesmo fato na primeira pessoa.
 */
export function avisoSomenteLeitura(
  motivo: MotivoSomenteLeitura | null,
  papelOutraParte: PapelNoChat,
  nomeOutraParte: string,
): string {
  const nome = primeiroNome(nomeOutraParte);
  // Quem vê é o Prestador quando a outra parte é o Empregador.
  const souPrestador = papelOutraParte === PapelNoChat.EMPREGADOR;
  let motivoTexto: string;
  switch (motivo) {
    case MotivoSomenteLeitura.OUTRO_PRESTADOR_ESCOLHIDO:
      motivoTexto = souPrestador
        ? `${nome} escolheu outro prestador para este serviço.`
        : "Você escolheu outro prestador para este serviço.";
      break;
    case MotivoSomenteLeitura.CANDIDATURA_RECUSADA:
      motivoTexto = souPrestador
        ? `${nome} recusou sua candidatura.`
        : "Você recusou esta candidatura.";
      break;
    case MotivoSomenteLeitura.CANDIDATO_DESISTIU:
      motivoTexto = souPrestador
        ? "Você desistiu desta candidatura."
        : `${nome} desistiu da candidatura.`;
      break;
    case MotivoSomenteLeitura.ANUNCIO_CANCELADO:
      motivoTexto = souPrestador ? `${nome} cancelou o anúncio.` : "Você cancelou o anúncio.";
      break;
    case MotivoSomenteLeitura.SERVICO_CANCELADO:
      motivoTexto = "O serviço foi cancelado.";
      break;
    case MotivoSomenteLeitura.CONTA_ENCERRADA:
      motivoTexto = "Esta conta foi encerrada.";
      break;
    case null:
      motivoTexto = "Esta conversa foi encerrada.";
      break;
  }
  return `${motivoTexto} ${SUFIXO_SOMENTE_LEITURA}`;
}
