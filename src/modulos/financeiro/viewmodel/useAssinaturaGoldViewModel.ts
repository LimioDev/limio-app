import { useRouter } from "expo-router";
import { useRef, useState } from "react";

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
  /** Renovação já cancelada: no lugar do "Cancelar renovação" vai o aviso de até quando vale. */
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
 * vale mais. O `StatusAssinatura` do back usa `CANCELADA` tanto pra cobrança
 * recusada quanto pro "Cancelar renovação" (ETI-83 ainda não fechou qual), e
 * no segundo caso o GOLD continua pago até `dataFimCiclo`: só conta como sem
 * GOLD quando não houve cancelamento de renovação ou o ciclo já acabou.
 */
function estaSemAssinatura(
  dados: AssinaturaGoldResponse | undefined,
  erro: unknown,
  agora: number = Date.now(),
): boolean {
  if (dados) {
    if (dados.status !== StatusAssinatura.CANCELADA) {
      return false;
    }
    return dados.canceladaEm === null || new Date(dados.dataFimCiclo).getTime() <= agora;
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
  // `isPending` só muda no próximo render: o ref segura o toque duplo (no
  // TanStack Query v5 só os callbacks do último `mutate` rodam).
  const cancelandoAgora = useRef(false);

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
    /**
     * "Conhecer o GOLD" (sem GOLD): tela 34. Com a renovação cancelada e o
     * ciclo ainda pago, assinar de novo daria `ASSINATURA_JA_ATIVA`; falta no
     * contrato do ETI-83 uma operação de retomar a renovação.
     */
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
      if (cancelandoAgora.current) {
        return;
      }
      cancelandoAgora.current = true;
      setErroCancelamento(null);
      cancelar.mutate(undefined, {
        onSettled: () => {
          cancelandoAgora.current = false;
        },
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
