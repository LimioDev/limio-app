import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { dataEHora, diaPorExtensoEHora, tempoAteExpirar } from "../servico/anuncio.helpers";
import {
  useCancelarReagendamentoMutation,
  useReagendamentoQuery,
  useResponderReagendamentoMutation,
  useServicoQuery,
} from "../servico/anuncio.queries";
import { DecisaoReagendamento, StatusReagendamento } from "../tipos/anuncio.enums";
import type { Reagendamento, ServicoCombinado } from "../tipos/anuncio.types";
import { rotaDoServico } from "./rotaDoServico";

export const MENSAGEM_PROPOSTA_EXPIRADA =
  "Esta proposta expirou. A data original continua valendo.";

/** O que a tela 41 deixa fazer: a contraparte responde, o proponente cancela. */
export type AcoesProposta = "responder" | "cancelar" | null;

export interface PropostaRecebidaExibida {
  /** "Proposta recebida" pra contraparte, "Proposta enviada" pro proponente. */
  titulo: string;
  /** Faixa do topo: prazo ("Expira em 21h04") ou por que a proposta acabou. */
  aviso: { titulo: string; texto: string | null; encerrada: boolean };
  /** A outra parte do serviço: quem propôs, ou quem ainda vai responder. */
  pessoa: { nome: string; fotoUrl: string | null; texto: string };
  /** "Quarta, 3 de setembro · 14:00". */
  de: string;
  para: string;
  justificativa: string | null;
  /** "O que muda se você aceitar": só pra quem responde. */
  mostrarOQueMuda: boolean;
  acoes: AcoesProposta;
}

const OUTRA_PARTE_SEM_CONTA = "Conta encerrada";

/** Por que uma proposta já não está aberta; `null` se ainda está. */
function motivoEncerrada(status: StatusReagendamento): string | null {
  switch (status) {
    case StatusReagendamento.PENDENTE:
      return null;
    case StatusReagendamento.ACEITO:
      return "Esta proposta foi aceita. A nova data já vale.";
    case StatusReagendamento.RECUSADO:
      return "Esta proposta foi recusada. A data original continua valendo.";
    case StatusReagendamento.CANCELADO:
      return "Esta proposta foi cancelada por quem propôs. A data original continua valendo.";
    case StatusReagendamento.EXPIRADO:
      return MENSAGEM_PROPOSTA_EXPIRADA;
    case StatusReagendamento.SEM_EFEITO:
      return "Esta proposta perdeu o efeito: o serviço não está mais combinado.";
  }
}

function propostaParaExibicao(
  proposta: Reagendamento,
  servico: ServicoCombinado,
  usuarioId: string | null,
  agora: Date,
): PropostaRecebidaExibida {
  const propusEu = proposta.proponenteId === usuarioId;
  const { outraParte } = servico;
  // A API só marca `EXPIRADO` quando o job roda: vencida e ainda `PENDENTE` já não aceita resposta.
  const restante = tempoAteExpirar(proposta.expiraEm, agora);
  const encerrada =
    motivoEncerrada(proposta.status) ?? (restante === null ? MENSAGEM_PROPOSTA_EXPIRADA : null);

  return {
    titulo: propusEu ? "Proposta enviada" : "Proposta recebida",
    aviso: encerrada
      ? { titulo: encerrada, texto: null, encerrada: true }
      : {
          titulo: `Expira em ${restante}`,
          texto: "Sem resposta, a data original é mantida.",
          encerrada: false,
        },
    pessoa: {
      nome: outraParte.nome ?? OUTRA_PARTE_SEM_CONTA,
      fotoUrl: outraParte.fotoUrl,
      texto: propusEu ? "ainda não respondeu à sua proposta" : "quer remarcar o serviço",
    },
    de: diaPorExtensoEHora(proposta.dataAnterior),
    para: diaPorExtensoEHora(proposta.dataProposta),
    justificativa: proposta.justificativa,
    mostrarOQueMuda: !propusEu && !encerrada,
    acoes: encerrada ? null : propusEu ? "cancelar" : "responder",
  };
}

/** Qual botão está esperando a API: trava os outros e mostra o carregando só nele. */
export type AcaoEmAndamento = "aceitar" | "recusar" | "cancelar" | null;

/**
 * Tela 41 "Proposta recebida" (ETI-100), pelo aviso de proposta pendente das
 * telas 25/36 e pelo `PROPOSTA_PENDENTE_EXISTENTE` da tela 40. O `anuncioId`
 * é o do serviço: a proposta aberta vem do `propostaPendente.id` dele.
 */
export function useRespostaReagendamentoViewModel(anuncioId: string) {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const usuarioId = useSessao((estado) => estado.usuarioId);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const servicoQuery = useServicoQuery(anuncioId);

  // Guarda o id da primeira consulta: depois de responder, o serviço volta sem
  // proposta pendente, e a tela não pode perder a proposta que está mostrando.
  const idPendente = servicoQuery.data?.propostaPendente?.id ?? null;
  const [reagendamentoId, setReagendamentoId] = useState<string | null>(null);
  if (reagendamentoId === null && idPendente !== null) {
    setReagendamentoId(idPendente);
  }

  const query = useReagendamentoQuery(reagendamentoId);
  const responder = useResponderReagendamentoMutation(reagendamentoId ?? "", anuncioId);
  const cancelar = useCancelarReagendamentoMutation(reagendamentoId ?? "", anuncioId);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<AcaoEmAndamento>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // "Expira em" anda sozinho enquanto a tela está aberta.
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace(rotaDoServico(anuncioId, papelAtivo));

  const servico = servicoQuery.data;
  const proposta = query.data;
  const codigoServico = erroApi(servicoQuery.error)?.codigo;
  const codigoProposta = erroApi(query.error)?.codigo;

  let erro: string | null = null;
  let podeTentarDeNovo = false;
  if (codigoServico === CodigoErro.SERVICO_NAO_ENCONTRADO) {
    erro = "Este serviço não está disponível.";
  } else if (codigoProposta === CodigoErro.REAGENDAMENTO_NAO_ENCONTRADO) {
    erro = "Esta proposta não está disponível.";
  } else if (servicoQuery.isError && !servico) {
    erro = mensagemErroApi(servicoQuery.error, "Não foi possível carregar o serviço.");
    podeTentarDeNovo = true;
  } else if (query.isError && !proposta) {
    erro = mensagemErroApi(query.error, "Não foi possível carregar a proposta.");
    podeTentarDeNovo = true;
  } else if (servico && reagendamentoId === null) {
    // Sem `propostaPendente.id` (limio-api#49 ainda não manda), não há como abrir.
    erro = servico.propostaPendente
      ? "Não foi possível abrir a proposta."
      : "Não há proposta de reagendamento aguardando resposta.";
  }

  const carregando =
    !erro && (servicoQuery.isPending || (reagendamentoId !== null && query.isPending));

  const tratarErro = (falha: unknown, padrao: string) => {
    setAcaoEmAndamento(null);
    switch (erroApi(falha)?.codigo) {
      case CodigoErro.PROPOSTA_EXPIRADA:
        mostrarToast(MENSAGEM_PROPOSTA_EXPIRADA, TipoToast.ERRO);
        voltar();
        return;
      case CodigoErro.PROPOSTA_ENCERRADA:
        mostrarToast("Esta proposta já foi encerrada.", TipoToast.ERRO);
        voltar();
        return;
      // Só no aceite: a data proposta passou antes da resposta.
      case CodigoErro.DATA_NO_PASSADO:
        mostrarToast(
          "A data proposta já passou. A data original continua valendo.",
          TipoToast.ERRO,
        );
        voltar();
        return;
      case CodigoErro.SERVICO_ESTADO_INVALIDO:
        mostrarToast("Este serviço não está mais combinado.", TipoToast.ERRO);
        voltar();
        return;
      case CodigoErro.REAGENDAMENTO_NAO_ENCONTRADO:
      case CodigoErro.SERVICO_NAO_ENCONTRADO:
        mostrarToast("Esta proposta não está mais disponível.", TipoToast.ERRO);
        voltar();
        return;
      default:
        setErroAcao(mensagemErroApi(falha, padrao));
    }
  };

  const responderCom = (decisao: DecisaoReagendamento) => {
    if (acaoEmAndamento || !reagendamentoId) {
      return;
    }
    setErroAcao(null);
    setAcaoEmAndamento(decisao === DecisaoReagendamento.ACEITAR ? "aceitar" : "recusar");
    responder.mutate(decisao, {
      onSuccess: (atualizado) => {
        setAcaoEmAndamento(null);
        mostrarToast(
          decisao === DecisaoReagendamento.ACEITAR
            ? `Nova data confirmada: ${dataEHora(atualizado.dataHoraPretendida)}`
            : "Proposta recusada. A data original continua valendo.",
        );
        voltar();
      },
      onError: (falha) => tratarErro(falha, "Não foi possível responder a proposta."),
    });
  };

  const cancelarProposta = () => {
    if (acaoEmAndamento || !reagendamentoId) {
      return;
    }
    setErroAcao(null);
    setAcaoEmAndamento("cancelar");
    cancelar.mutate(undefined, {
      onSuccess: () => {
        setAcaoEmAndamento(null);
        mostrarToast("Proposta cancelada. A data original continua valendo.");
        voltar();
      },
      onError: (falha) => tratarErro(falha, "Não foi possível cancelar a proposta."),
    });
  };

  return {
    proposta:
      !erro && servico && proposta
        ? propostaParaExibicao(proposta, servico, usuarioId, agora)
        : null,
    carregando,
    erro,
    podeTentarDeNovo,
    atualizando: servicoQuery.isRefetching || query.isRefetching,
    aoTentarDeNovo: () => {
      void servicoQuery.refetch();
      if (reagendamentoId) {
        void query.refetch();
      }
    },
    acaoEmAndamento,
    erroAcao,
    aoAceitar: () => responderCom(DecisaoReagendamento.ACEITAR),
    aoRecusar: () => responderCom(DecisaoReagendamento.RECUSAR),
    aoCancelarProposta: cancelarProposta,
    aoVoltar: voltar,
  };
}
