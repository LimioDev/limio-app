import { useRouter } from "expo-router";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { formatarPreco, rotuloCartao, textoRenovacao } from "../servico/gold.helpers";
import { usePlanoGoldQuery } from "../servico/gold.queries";
import { sufixoCiclo } from "../tipos/gold.enums";
import type { PlanoGoldResponse } from "../tipos/gold.types";

export interface AssinaturaGoldExibida {
  /** "R$ 29,90/mês · renova em 18/12"; sem a data quando ela não veio. */
  resumo: string;
  /** "Visa •••• 4419"; `null` sem cartão salvo. */
  cartao: string | null;
}

function paraExibicao(plano: PlanoGoldResponse, renovaEm?: string): AssinaturaGoldExibida {
  const preco = `${formatarPreco(plano.precoCentavos, plano.moeda)}${sufixoCiclo(plano.ciclo)}`;
  return {
    resumo: renovaEm ? `${preco} · ${textoRenovacao(renovaEm)}` : preco,
    cartao: plano.cartaoSalvo ? rotuloCartao(plano.cartaoSalvo) : null,
  };
}

/**
 * Tela 35 "Assinatura GOLD", versão mínima do ETI-82: confirma o GOLD ativo
 * depois de assinar (ou do `ASSINATURA_JA_ATIVA`). Cobranças, trocar cartão e
 * cancelar renovação entram com o ETI-84, que também deve trazer a data de
 * renovação da API; até lá ela só aparece quando vem da assinatura (`renovaEm`).
 */
export function useAssinaturaGoldViewModel(renovaEm?: string) {
  const router = useRouter();
  // Em cache pela tela 34; a assinatura recarrega o cartão usado na cobrança.
  const query = usePlanoGoldQuery();

  return {
    carregando: query.isPending,
    erro:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar sua assinatura.")
        : null,
    tentandoDeNovo: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    assinatura: query.data ? paraExibicao(query.data, renovaEm) : null,
    aoVoltar: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/(prestador)");
      }
    },
  };
}

export type AssinaturaGoldViewModel = ReturnType<typeof useAssinaturaGoldViewModel>;
