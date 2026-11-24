import { useRouter } from "expo-router";
import { useState } from "react";

import { formatarDataHora } from "../../../comum/lib/datas";
import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  formatarPreco,
  linhaCobranca,
  novaTentativaPendente,
  rotuloCartao,
  type LinhaCobranca,
} from "../servico/gold.helpers";
import { useCancelarRenovacaoMutation, useMinhaAssinaturaQuery } from "../servico/gold.queries";
import { StatusAssinatura, sufixoCiclo } from "../tipos/gold.enums";
import type { AssinaturaGoldResponse } from "../tipos/gold.types";

export interface AssinaturaGoldExibida {
  /** "Ativa"; "Processando" enquanto a cobrança não confirma. */
  selo: string;
  /** "R$ 29,90/mês · renova em 30/09" ou, cancelada, "R$ 29,90/mês · GOLD até 30/09". */
  resumo: string;
  /** "30/09": fim do período pago. */
  ateQuando: string;
  /** Renovação já cancelada: no lugar do "Cancelar renovação" vai o "Assinar de novo". */
  renovacaoCancelada: boolean;
  /** Data da nova tentativa quando a última cobrança foi recusada; senão `null`. */
  novaTentativaEm: string | null;
  /** "Visa •••• 4419"; `null` sem cartão. */
  cartao: string | null;
  cobrancas: LinhaCobranca[];
}

function paraExibicao(assinatura: AssinaturaGoldResponse): AssinaturaGoldExibida {
  const preco = `${formatarPreco(assinatura.precoCentavos, assinatura.moeda)}${sufixoCiclo(assinatura.ciclo)}`;
  const ateQuando = formatarDataHora(assinatura.dataFimCiclo, "dd/MM");
  const renovacaoCancelada = assinatura.canceladaEm !== null;
  return {
    selo: assinatura.status === StatusAssinatura.PENDENTE ? "Processando" : "Ativa",
    resumo: renovacaoCancelada
      ? `${preco} · GOLD até ${ateQuando}`
      : `${preco} · renova em ${ateQuando}`,
    ateQuando,
    renovacaoCancelada,
    novaTentativaEm: novaTentativaPendente(assinatura.cobrancas),
    cartao: assinatura.cartao ? rotuloCartao(assinatura.cartao) : null,
    cobrancas: assinatura.cobrancas.map((cobranca) => linhaCobranca(cobranca, assinatura.moeda)),
  };
}

/**
 * Sem GOLD: nunca assinou (`ASSINATURA_NAO_ENCONTRADA`) ou a assinatura não
 * chegou a valer (`CANCELADA` = cobrança recusada ou ciclo encerrado).
 */
function estaSemAssinatura(dados: AssinaturaGoldResponse | undefined, erro: unknown): boolean {
  if (dados) {
    return dados.status === StatusAssinatura.CANCELADA;
  }
  return erroApi(erro)?.codigo === CodigoErro.ASSINATURA_NAO_ENCONTRADA;
}

/**
 * Tela 35 "Assinatura GOLD" (ETI-84): status e renovação, alerta de cobrança
 * recusada, cartão com "Trocar", cobranças e "Cancelar renovação". Chega-se
 * pelo "Plano e cota" de Meu perfil e depois de assinar na tela 34.
 */
export function useAssinaturaGoldViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useMinhaAssinaturaQuery();
  const cancelar = useCancelarRenovacaoMutation();

  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);

  const semAssinatura = estaSemAssinatura(query.data, query.error);

  return {
    carregando: query.isPending,
    // Com cache, o erro de uma nova consulta não esconde a tela.
    erro:
      query.isError && !query.data && !semAssinatura
        ? mensagemErroApi(query.error, "Não foi possível carregar sua assinatura.")
        : null,
    semAssinatura,
    tentandoDeNovo: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    assinatura: query.data && !semAssinatura ? paraExibicao(query.data) : null,
    aoTrocarCartao: () => router.push("/(app)/conta/cartao"),
    /** "Assinar de novo" (renovação cancelada) e "Conhecer o GOLD" (sem GOLD): tela 34. */
    aoAssinar: () => router.push("/(app)/conta/assinatura"),

    confirmandoCancelamento,
    cancelando: cancelar.isPending,
    erroCancelamento,
    aoPedirCancelamento: () => {
      setErroCancelamento(null);
      setConfirmandoCancelamento(true);
    },
    // Com a chamada em andamento a folha não fecha: o resultado decide.
    aoManterRenovacao: () => {
      if (!cancelar.isPending) {
        setConfirmandoCancelamento(false);
      }
    },
    aoConfirmarCancelamento: () => {
      if (cancelar.isPending) {
        return;
      }
      setErroCancelamento(null);
      cancelar.mutate(undefined, {
        onSuccess: (atualizada) => {
          setConfirmandoCancelamento(false);
          mostrarToast(
            `Renovação cancelada. Seu GOLD vale até ${formatarDataHora(atualizada.dataFimCiclo, "dd/MM")}.`,
            TipoToast.SUCESSO,
          );
        },
        onError: (falha) => {
          setErroCancelamento(
            erroApi(falha)?.codigo === CodigoErro.GATEWAY_INDISPONIVEL
              ? "Não foi possível cancelar agora. Tente de novo mais tarde."
              : mensagemErroApi(falha, "Não foi possível cancelar a renovação."),
          );
        },
      });
    },

    aoVoltar: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/(prestador)/perfil");
      }
    },
  };
}

export type AssinaturaGoldViewModel = ReturnType<typeof useAssinaturaGoldViewModel>;
