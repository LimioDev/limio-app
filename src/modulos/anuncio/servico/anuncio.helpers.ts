import { isAxiosError } from "axios";
import { differenceInCalendarDays, format, isToday, isTomorrow, subMonths } from "date-fns";

import { rotuloEstado } from "../../../comum/componentes/ui/Badge";
import { formatarDataHora, formatarDiaPorExtenso, paraFusoLocal } from "../../../comum/lib/datas";
import { erroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { MENSAGEM_FOTO_INVALIDA } from "../../../comum/tipos/foto";
import { PeriodoHistorico, StatusAnuncio } from "../tipos/anuncio.enums";
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

/** Meses de cada atalho de período da tela 44. */
const MESES_DO_PERIODO = {
  [PeriodoHistorico.TRES_MESES]: 3,
  [PeriodoHistorico.SEIS_MESES]: 6,
  [PeriodoHistorico.DOZE_MESES]: 12,
} as const;

/**
 * Intervalo de um atalho de período ("Últimos 3 meses"), em dias de Brasília
 * (`yyyy-MM-dd`, os dois inclusos): de hoje menos N meses até hoje.
 */
export function intervaloDoAtalho(
  periodo: Exclude<PeriodoHistorico, typeof PeriodoHistorico.PERSONALIZADO>,
  agora: Date = new Date(),
): { dataInicio: string; dataFim: string } {
  const hoje = paraFusoLocal(agora);
  return {
    dataInicio: format(subMonths(hoje, MESES_DO_PERIODO[periodo]), "yyyy-MM-dd"),
    dataFim: format(hoje, "yyyy-MM-dd"),
  };
}

/** "2026-06-01" → "01/06/2026". */
export function diaDigitado(dia: string): string {
  const [ano, mes, d] = dia.split("-");
  return `${d}/${mes}/${ano}`;
}

/** "01/06/2026 — 31/08/2026", o período da tela 44. */
export function textoPeriodo(dataInicio: string, dataFim: string): string {
  return `${diaDigitado(dataInicio)} — ${diaDigitado(dataFim)}`;
}

/** "28/08" no ano corrente, "28/08/2025" em outro: data do item do histórico. */
export function dataCurtaHistorico(dataUtc: string, agora: Date = new Date()): string {
  const data = paraFusoLocal(dataUtc);
  const mesmoAno = data.getFullYear() === paraFusoLocal(agora).getFullYear();
  return format(data, mesmoAno ? "dd/MM" : "dd/MM/yyyy");
}
