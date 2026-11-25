import { isAxiosError } from "axios";
import { differenceInCalendarDays, format, isToday, isTomorrow } from "date-fns";

import { rotuloEstado } from "../../../comum/componentes/ui/Badge";
import { formatarDataHora, formatarDiaPorExtenso, paraFusoLocal } from "../../../comum/lib/datas";
import { erroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { MENSAGEM_FOTO_INVALIDA } from "../../../comum/tipos/foto";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { ServicoCombinado } from "../tipos/anuncio.types";

/** Aviso de permissão negada nas telas 14 e 16a. */
export const MOTIVO_PERMISSAO_FOTO_ANUNCIO = {
  camera: "Para tirar fotos do anúncio",
  galeria: "Para anexar fotos ao anúncio",
};

// Os rótulos do protótipo ("Qua") não batem com o `EEE` do ptBR ("qua.").
const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const formatoDistancia = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

/** "Qua, 03/09", no fuso do sistema. */
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

/** "Rafael" de "Rafael S.": nome usado nos textos corridos das folhas. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] || nome;
}

/** "Marcos Vieira" → "Marcos V."; um nome só fica como está. */
export function nomeComInicial(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const ultimo = partes.length > 1 ? partes[partes.length - 1] : "";
  return ultimo ? `${partes[0]} ${ultimo.charAt(0).toUpperCase()}.` : nome.trim();
}

/**
 * Linha de baixo do card do alvo na tela 46 (ETI-115): "Concluído em 31/08 ·
 * com Marcos V.". Sem nome (conta encerrada), só o status.
 */
export function detalheServicoParaDenuncia(servico: ServicoCombinado): string {
  const estado = rotuloEstado(estadoDoAnuncio(servico.status, true));
  const status =
    servico.status === StatusAnuncio.CONCLUIDO && servico.validadoEm
      ? `${estado} em ${formatarDataHora(servico.validadoEm, "dd/MM")}`
      : estado;
  const nome = servico.outraParte.nome;
  return nome ? `${status} · com ${nomeComInicial(nome)}` : status;
}

/** "02/09 é amanhã", "02/09 é hoje" ou só "02/09" — dica "Rever a data" da tela 19. */
export function dataComProximidade(dataHoraUtc: string): string {
  const data = paraFusoLocal(dataHoraUtc);
  const dia = format(data, "dd/MM");
  if (isToday(data)) {
    return `${dia} é hoje`;
  }
  return isTomorrow(data) ? `${dia} é amanhã` : dia;
}

/**
 * "hoje · 14:06" ou "31/08 · 14:11", no fuso do sistema — linha do tempo do
 * serviço (tela 37). `agora` só existe pra teste.
 */
export function momentoDoPasso(dataHoraUtc: string, agora: Date = new Date()): string {
  const data = paraFusoLocal(dataHoraUtc);
  const ehHoje = format(data, "yyyy-MM-dd") === format(paraFusoLocal(agora), "yyyy-MM-dd");
  return `${ehHoje ? "hoje" : format(data, "dd/MM")} · ${format(data, "HH:mm")}`;
}

/**
 * "hoje", "amanhã" ou "em 3 dias", contando dias de calendário no fuso do
 * sistema — card de status da tela 25. `null` pra data que já passou.
 * `agora` só existe pra teste.
 */
export function emQuantosDias(dataHoraUtc: string, agora: Date = new Date()): string | null {
  const dias = differenceInCalendarDays(paraFusoLocal(dataHoraUtc), paraFusoLocal(agora));
  if (dias < 0) {
    return null;
  }
  if (dias === 0) {
    return "hoje";
  }
  return dias === 1 ? "amanhã" : `em ${dias} dias`;
}

/**
 * "Hoje às 16:38" ou "31/08 às 16:38", no fuso do sistema — quando o check-out
 * foi feito, na tela 27. `agora` só existe pra teste.
 */
export function diaEHoraDoCheckout(dataHoraUtc: string, agora: Date = new Date()): string {
  const data = paraFusoLocal(dataHoraUtc);
  const ehHoje = format(data, "yyyy-MM-dd") === format(paraFusoLocal(agora), "yyyy-MM-dd");
  return `${ehHoje ? "Hoje" : format(data, "dd/MM")} às ${format(data, "HH:mm")}`;
}

/** "02/09, 14:00" — momentos citados nos textos corridos (rodapés da tela 25). */
export function dataEHora(dataHoraUtc: string): string {
  return format(paraFusoLocal(dataHoraUtc), "dd/MM, HH:mm");
}

/** "03/09 às 14:00" — prazos citados na tela 26. */
export function diaAsHora(dataHoraUtc: string): string {
  return format(paraFusoLocal(dataHoraUtc), "dd/MM 'às' HH:mm");
}

/**
 * "Faltam 3 dias" ou "Falta 1 dia", contando dias de calendário no fuso do
 * sistema; "Falta menos de 1 dia" no mesmo dia — tela 26. `agora` só existe
 * pra teste.
 */
export function faltamDias(dataHoraUtc: string, agora: Date = new Date()): string {
  const dias = differenceInCalendarDays(paraFusoLocal(dataHoraUtc), paraFusoLocal(agora));
  if (dias <= 0) {
    return "Falta menos de 1 dia";
  }
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`;
}

/** "2 mensagens novas", "1 mensagem nova" ou "Nenhuma mensagem nova" — card "Conversar com". */
export function mensagensNovas(naoLidas: number): string {
  if (naoLidas === 0) {
    return "Nenhuma mensagem nova";
  }
  return naoLidas === 1 ? "1 mensagem nova" : `${naoLidas} mensagens novas`;
}

/**
 * Aviso de proposta de reagendamento pendente (telas 25 e 36), que abre a
 * tela 41 (ETI-100). Sem `proponenteId` (a API ainda não manda), o texto não
 * diz quem propôs.
 */
export function avisoPropostaPendente(
  proposta: { dataProposta: string; proponenteId?: string | null },
  usuarioId: string | null,
  outraParte: string,
): string {
  const quando = dataEHora(proposta.dataProposta);
  const propusEu = proposta.proponenteId ? proposta.proponenteId === usuarioId : null;
  if (propusEu === true) {
    return `Proposta enviada, aguardando resposta: nova data em ${quando}.`;
  }
  if (propusEu === false) {
    return `${outraParte} propôs remarcar o serviço para ${quando}.`;
  }
  return `Há uma proposta de reagendamento para ${quando}.`;
}

/** "Quarta, 3 de setembro · 14:00" — datas das telas 40 e 41. */
export function diaPorExtensoEHora(dataHoraUtc: string): string {
  return `${formatarDiaPorExtenso(dataHoraUtc)} · ${horaPretendida(dataHoraUtc)}`;
}

/**
 * Quanto falta até `expiraEm`, arredondado pra baixo como uma contagem
 * regressiva: "21h04", "45 min", "menos de 1 min" ou `null` se já venceu —
 * aviso "Expira em" da tela 41. `agora` só existe pra teste.
 */
export function tempoAteExpirar(expiraEmUtc: string, agora: Date = new Date()): string | null {
  const restanteMs = new Date(expiraEmUtc).getTime() - agora.getTime();
  if (restanteMs <= 0) {
    return null;
  }
  const minutos = Math.floor(restanteMs / 60_000);
  if (minutos < 1) {
    return "menos de 1 min";
  }
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  return `${horas}h${String(minutos % 60).padStart(2, "0")}`;
}

/** Motivo de uma foto do anúncio não ter subido, pro aviso depois de publicar ou salvar. */
export function mensagemFalhaFoto(erro: unknown): string {
  const resposta = erroApi(erro);
  switch (resposta?.codigo) {
    case CodigoErro.FOTO_INVALIDA:
    case CodigoErro.ARQUIVO_GRANDE_DEMAIS:
      return MENSAGEM_FOTO_INVALIDA;
    default:
      return resposta?.mensagem ?? "Não foi possível enviar a foto.";
  }
}

/** O anúncio não existe ou é de outra pessoa (a API responde 404 nos dois casos). */
export function anuncioNaoEncontrado(erro: unknown): boolean {
  return (
    erroApi(erro)?.codigo === CodigoErro.ANUNCIO_NAO_ENCONTRADO ||
    (isAxiosError(erro) && erro.response?.status === 404)
  );
}
