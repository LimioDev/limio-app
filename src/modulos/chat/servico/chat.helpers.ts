import { differenceInCalendarDays, format } from "date-fns";

import { paraFusoLocal } from "../../../comum/lib/datas";
import { StatusAplicacao } from "../../../comum/tipos/aplicacao";
import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { MotivoSomenteLeitura, PapelNoChat, SeloConversa } from "../tipos/chat.enums";

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

/**
 * Hora do item da tela 42: "14:11" no mesmo dia, "27/08" no mesmo ano e
 * "27/08/25" antes disso, no fuso do sistema.
 */
export function horaConversa(dataUtc: string, agora: Date = new Date()): string {
  const quando = paraFusoLocal(dataUtc);
  const hoje = paraFusoLocal(agora);
  if (differenceInCalendarDays(hoje, quando) === 0) {
    return format(quando, "HH:mm");
  }
  return format(quando, quando.getFullYear() === hoje.getFullYear() ? "dd/MM" : "dd/MM/yy");
}

/**
 * Selo do item da tela 42. Encerrada é a conversa que não recebe mais
 * mensagens (`isSomenteLeitura`, ou candidatura recusada/encerrada). Fora
 * isso, a candidatura ainda enviada é "Candidato(a)"/"Pendente"; escolhida e
 * as seguintes, "Escolhido"/"Combinado".
 */
export function seloConversa(
  statusCandidatura: StatusAplicacao | null,
  somenteLeitura: boolean,
  papel: PapelDoApp,
): SeloConversa {
  const ehEmpregador = papel === PapelUsuario.EMPREGADOR;
  if (
    somenteLeitura ||
    statusCandidatura === null ||
    statusCandidatura === StatusAplicacao.RECUSADA ||
    statusCandidatura === StatusAplicacao.ENCERRADA
  ) {
    return SeloConversa.ENCERRADA;
  }
  switch (statusCandidatura) {
    case StatusAplicacao.ENVIADA:
      return ehEmpregador ? SeloConversa.CANDIDATO : SeloConversa.PENDENTE;
    case StatusAplicacao.ESCOLHIDA:
    case StatusAplicacao.AGUARDANDO_VALIDACAO:
    case StatusAplicacao.CONCLUIDA:
      return ehEmpregador ? SeloConversa.ESCOLHIDO : SeloConversa.COMBINADO;
  }
}

/** Texto do selo, como no card do ETI-104. */
export function rotuloSeloConversa(selo: SeloConversa): string {
  switch (selo) {
    case SeloConversa.ESCOLHIDO:
      return "Escolhido";
    case SeloConversa.CANDIDATO:
      return "Candidato(a)";
    case SeloConversa.COMBINADO:
      return "Combinado";
    case SeloConversa.PENDENTE:
      return "Pendente";
    case SeloConversa.ENCERRADA:
      return "Encerrada";
  }
}
