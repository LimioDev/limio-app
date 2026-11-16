import { format } from "date-fns";

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
