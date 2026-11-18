import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";

import { formatarDiaPorExtenso } from "../../../comum/lib/datas";
import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { formatarTelefone, telefoneNacional } from "../../../comum/lib/telefone";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  avisoPropostaPendente,
  dataEHora,
  emQuantosDias,
  estadoDoAnuncio,
  horaPretendida,
  mensagensNovas,
  primeiroNome,
} from "../servico/anuncio.helpers";
import { useServicoQuery } from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { ServicoCombinado } from "../tipos/anuncio.types";

/** `proximo`: o passo que vem a seguir, mas que pode ser pulado (iniciar é opcional, ETI-88). */
export type SituacaoEtapa = "feito" | "atual" | "proximo" | "futuro";

export interface EtapaServicoExibida {
  rotulo: string;
  situacao: SituacaoEtapa;
}

export interface ServicoCombinadoExibido {
  estado: Estado;
  /** "Quarta, 3 de setembro". */
  dia: string;
  /** "14:00 · em 3 dias", "14:00 · hoje" ou só "14:00" (cancelado ou já passou). */
  quando: string;
  prestador: {
    nome: string;
    fotoUrl: string | null;
    gold: boolean;
    /** "(11) 99123-4477"; `null` quando a conta foi encerrada. */
    telefone: string | null;
  };
  /** `null` quando a API não conseguiu montar o endereço. */
  endereco: string | null;
  bairro: string | null;
  conversa: {
    /** "Conversar com Rafael". */
    titulo: string;
    /** "2 mensagens novas", "Nenhuma mensagem nova" ou "Conversa em somente leitura". */
    detalhe: string;
  };
  /** Serviço cancelado: tela só pra consulta (25d), sem "Informar" e sem ações. */
  encerrado: boolean;
  /** Linha "Andamento": Combinado, Iniciado, Check-out e Validado. */
  etapas: EtapaServicoExibida[];
  /** "Há uma proposta de reagendamento para 05/09, 10:00." (ETI-100 traz o atalho). */
  propostaPendente: string | null;
  /** Texto de baixo dos botões (ou do aviso de cancelado). */
  rodape: string | null;
  /**
   * Ações do Empregador derivadas do status. "Validar serviço" (tela 27,
   * ETI-93) já aparece; "Reagendar" (ETI-100) e "Cancelar" (ETI-95) são
   * calculadas aqui, mas só aparecem quando os cards deles entrarem.
   */
  acoes: AcoesDoEmpregador;
  /** "Avaliar Rafael" (tela 45, ETI-108): só com o serviço concluído. */
  podeAvaliar: boolean;
  /** "Avaliar Rafael". */
  rotuloAvaliar: string;
}

export interface AcoesDoEmpregador {
  /**
   * Pelo protótipo: `presencial` (botão contornado) com o serviço combinado ou
   * em andamento (validação no local, ETI-92) e `checkout` (botão cheio)
   * aguardando validação. `null` nos outros status.
   */
  validar: "presencial" | "checkout" | null;
  /** Só combinado e abaixo do limite de reagendamentos aceitos ("1 de 2"). */
  reagendar: boolean;
  /** Só combinado e até o prazo que a API devolve (data vigente menos 24h). */
  cancelar: boolean;
}

const PRESTADOR_SEM_CONTA = "Conta encerrada";

/** Ordem do andamento; cada status marca até onde o serviço já chegou. */
const ETAPAS = ["Combinado", "Iniciado", "Check-out", "Validado"] as const;

/**
 * Índice da última etapa feita. Iniciar é opcional (ETI-88): um check-out
 * feito marca "Iniciado" como feito também, mesmo sem `iniciadoEm`. Concluído
 * sem `validadoEm` é a conclusão automática depois do prazo.
 */
function ultimaEtapaFeita(servico: ServicoCombinado): number {
  switch (servico.status) {
    case StatusAnuncio.CONCLUIDO:
      return 3;
    case StatusAnuncio.AGUARDANDO_VALIDACAO:
      return 2;
    case StatusAnuncio.EM_ANDAMENTO:
      return 1;
    case StatusAnuncio.PUBLICADO:
      return 0;
    // Cancelado: vale o que aconteceu antes do cancelamento.
    case StatusAnuncio.ENCERRADO:
      if (servico.validadoEm) return 3;
      if (servico.checkoutEm) return 2;
      if (servico.iniciadoEm) return 1;
      return 0;
  }
}

function etapasDoServico(servico: ServicoCombinado): EtapaServicoExibida[] {
  const feitas = ultimaEtapaFeita(servico);
  const emCurso =
    servico.status === StatusAnuncio.EM_ANDAMENTO ||
    servico.status === StatusAnuncio.AGUARDANDO_VALIDACAO;
  return ETAPAS.map((rotulo, indice) => {
    let situacao: SituacaoEtapa = "futuro";
    if (indice <= feitas) {
      situacao = "feito";
    } else if (indice === feitas + 1) {
      if (emCurso) {
        situacao = "atual";
      } else if (servico.status === StatusAnuncio.PUBLICADO) {
        situacao = "proximo";
      }
    }
    return { rotulo, situacao };
  });
}

function rodape(servico: ServicoCombinado, nome: string): string | null {
  switch (servico.status) {
    // "Cancelamento permitido até..." e "(nome) é GOLD, então não há cota a
    // estornar." voltam com o "Cancelar" (ETI-95).
    case StatusAnuncio.PUBLICADO:
      return null;
    case StatusAnuncio.EM_ANDAMENTO:
      return "Vi o serviço pronto no local? Você já pode validar. O serviço já começou: não dá mais para cancelar nem reagendar.";
    case StatusAnuncio.AGUARDANDO_VALIDACAO: {
      const quando = servico.checkoutEm ? ` em ${dataEHora(servico.checkoutEm)}` : "";
      return `${nome} enviou o check-out${quando}. Você tem 24h para validar. Sem resposta, o serviço é concluído automaticamente.`;
    }
    case StatusAnuncio.CONCLUIDO: {
      const quando = servico.validadoEm ? ` em ${dataEHora(servico.validadoEm)}` : "";
      return `Serviço concluído${quando}. Combine o pagamento direto com ${nome}, por PIX, dinheiro ou transferência.`;
    }
    // A API não devolve quando foi cancelado; o protótipo mostra "em 01/09, 10:12".
    case StatusAnuncio.ENCERRADO:
      return "Serviço cancelado. Esta tela fica disponível só para consulta, sem ações.";
  }
}

function acoesDoEmpregador(servico: ServicoCombinado, agora: Date): AcoesDoEmpregador {
  const combinado = servico.status === StatusAnuncio.PUBLICADO;
  const prazo = servico.prazoCancelamentoEm;
  let validar: AcoesDoEmpregador["validar"] = null;
  if (combinado || servico.status === StatusAnuncio.EM_ANDAMENTO) {
    validar = "presencial";
  } else if (servico.status === StatusAnuncio.AGUARDANDO_VALIDACAO) {
    validar = "checkout";
  }
  return {
    validar,
    reagendar: combinado && servico.reagendamentosAceitos < servico.limiteReagendamentos,
    cancelar: combinado && prazo !== null && new Date(prazo) > agora,
  };
}

function servicoParaExibicao(
  servico: ServicoCombinado,
  agora: Date = new Date(),
): ServicoCombinadoExibido {
  const { outraParte } = servico;
  const nomeCompleto = outraParte.nome ?? PRESTADOR_SEM_CONTA;
  const nome = outraParte.nome ? primeiroNome(outraParte.nome) : "o Prestador";
  const encerrado = servico.status === StatusAnuncio.ENCERRADO;
  const hora = horaPretendida(servico.dataHoraPretendida);
  const distancia = encerrado ? null : emQuantosDias(servico.dataHoraPretendida, agora);
  return {
    // Aqui sempre existe Prestador escolhido: `PUBLICADO` é o "Combinado".
    estado: estadoDoAnuncio(servico.status, true),
    dia: formatarDiaPorExtenso(servico.dataHoraPretendida),
    quando: distancia ? `${hora} · ${distancia}` : hora,
    prestador: {
      nome: nomeCompleto,
      fotoUrl: outraParte.fotoUrl,
      gold: outraParte.gold === true,
      telefone: outraParte.telefone
        ? formatarTelefone(telefoneNacional(outraParte.telefone))
        : null,
    },
    endereco: servico.enderecoCompleto,
    bairro: servico.bairroRegiao,
    conversa: {
      titulo: `Conversar com ${nome}`,
      detalhe: encerrado
        ? "Conversa em somente leitura"
        : mensagensNovas(servico.mensagensNaoLidas),
    },
    encerrado,
    etapas: etapasDoServico(servico),
    propostaPendente:
      servico.propostaPendente && !encerrado
        ? avisoPropostaPendente(servico.propostaPendente.dataProposta)
        : null,
    rodape: rodape(servico, nome),
    acoes: acoesDoEmpregador(servico, agora),
    podeAvaliar: servico.status === StatusAnuncio.CONCLUIDO,
    rotuloAvaliar: `Avaliar ${nome}`,
  };
}

/** Tela 25 "Serviço combinado" do Empregador e as variantes 25b a 25e (ETI-87). */
export function useServicoCombinadoViewModel(anuncioId: string) {
  const router = useRouter();
  const query = useServicoQuery(anuncioId);

  // A tela continua montada embaixo do chat e da tela 45, e o React Query no
  // React Native não consulta de novo ao voltar o foco. O primeiro foco é
  // pulado porque o mount já consultou.
  const { refetch } = query;
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      void refetch();
    }, [refetch]),
  );

  // Numa recarga com erro o React Query mantém o `data` anterior. Se o serviço
  // deixou de existir pra ele, contato e endereço não podem continuar na tela.
  const naoDisponivel = erroApi(query.error)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO;
  const dados = naoDisponivel ? undefined : query.data;

  let erro: string | null = null;
  if (naoDisponivel) {
    erro = "Este serviço não está disponível.";
  } else if (query.isError && !dados) {
    erro = mensagemErroApi(query.error, "Não foi possível carregar o serviço.");
  }

  const telefone = dados?.outraParte.telefone ? telefoneNacional(dados.outraParte.telefone) : null;
  const candidaturaId = dados?.candidaturaId ?? null;

  // Aberta direto pelo link (sem tela antes), volta pro Início.
  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace("/(app)/(contratante)");

  return {
    servico: dados ? servicoParaExibicao(dados) : null,
    carregando: query.isPending,
    erro,
    // `SERVICO_NAO_ENCONTRADO`: mensagem e volta pra tela anterior, sem "Tentar de novo".
    podeTentarDeNovo: !naoDisponivel,
    atualizando: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    aoAtualizar: () => void query.refetch(),
    aoVoltar: voltar,
    aoLigar: telefone ? () => void Linking.openURL(`tel:${telefone}`) : undefined,
    // Tela 21 (ETI-102). O chat abre pela candidatura, que a API ainda não manda.
    aoConversar: candidaturaId
      ? () =>
          router.push({
            pathname: "/(app)/chat/[aplicacaoId]",
            params: { aplicacaoId: candidaturaId },
          })
      : undefined,
    // Tela 27 (ETI-93).
    aoValidar: () =>
      router.push({ pathname: "/(app)/servico/validar/[id]", params: { id: anuncioId } }),
    // Tela 45 (ETI-108).
    aoAvaliar: () =>
      router.push({ pathname: "/(app)/avaliacao/[anuncioId]", params: { anuncioId } }),
  };
}
