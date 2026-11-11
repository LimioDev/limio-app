import { useRouter } from "expo-router";

import { formatarDataHora } from "../../../comum/lib/datas";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { formatarMesDaCota, formatarRenovacao } from "../servico/cota.helpers";
import { useCotaDoMesQuery } from "../servico/cota.queries";
import { Plano, rotuloStatusEscolha } from "../tipos/cota.enums";
import type { CotaDoMesResponse } from "../tipos/cota.types";

export interface EscolhaExibida {
  id: string;
  titulo: string;
  /** "07/08 · Concluído": data do serviço e status. */
  detalhe: string;
}

export interface CotaExibida {
  /** "AGOSTO 2026". */
  mes: string;
  /** "4 de 4" no FREE; "3" no GOLD. */
  destaque: string;
  /** "escolhas usadas" ao lado do destaque. */
  complemento: string;
  /** Um segmento por escolha do teto, `true` quando usado. Vazio no GOLD. */
  segmentos: boolean[];
  /** "Renova em 1º de setembro, 00:00". */
  renovacao: string;
  titulo: string;
  texto: string;
  escolhas: EscolhaExibida[];
}

function plural(total: number, singular: string, pluralTexto: string): string {
  return `${total} ${total === 1 ? singular : pluralTexto}`;
}

function cotaParaExibicao(cota: CotaDoMesResponse): CotaExibida {
  const comum = {
    mes: formatarMesDaCota(cota.anoMes),
    renovacao: formatarRenovacao(cota.renovaEm, true),
    escolhas: cota.escolhas.map((escolha) => ({
      id: escolha.anuncioId,
      titulo: escolha.titulo,
      detalhe: `${formatarDataHora(escolha.dataHoraServico, "dd/MM")} · ${rotuloStatusEscolha(escolha.status)}`,
    })),
  };

  // GOLD (sem tela no Figma): sem teto, só a contagem do mês.
  if (cota.plano === Plano.GOLD || cota.tetoAplicado === null) {
    return {
      ...comum,
      destaque: String(cota.escolhasConsumidas),
      complemento: cota.escolhasConsumidas === 1 ? "escolha neste mês" : "escolhas neste mês",
      segmentos: [],
      titulo: "GOLD ativo · escolhas ilimitadas",
      texto: "No plano GOLD, as escolhas do mês não têm limite.",
    };
  }

  const teto = cota.tetoAplicado;
  const usadas = cota.escolhasConsumidas;
  const restantes = Math.max(teto - usadas, 0);
  return {
    ...comum,
    destaque: `${usadas} de ${teto}`,
    complemento: "escolhas usadas",
    segmentos: Array.from({ length: teto }, (_, indice) => indice < usadas),
    // Quem diz se esgotou é a API, não a conta acima.
    ...(cota.esgotada
      ? {
          titulo: "Você atingiu o limite do plano gratuito",
          texto:
            "Você não pode se candidatar até a cota renovar. As candidaturas pendentes continuam valendo.",
        }
      : {
          titulo: `${restantes === 1 ? "Resta" : "Restam"} ${plural(restantes, "escolha", "escolhas")} neste mês`,
          texto: "Cada vez que um Empregador escolhe sua candidatura, 1 escolha da cota é usada.",
        }),
  };
}

/**
 * Tela 33 "Cota do mês" (33 esgotada e 33b parcial). Chega-se pela faixa do
 * mural ou pela candidatura recusada com `COTA_ESGOTADA` (ETI-76).
 */
export function useCotaDoMesViewModel() {
  const router = useRouter();
  // O card pede consultar a cota ao abrir: vindo do `COTA_ESGOTADA`, o cache
  // do mural pode estar desatualizado.
  const query = useCotaDoMesQuery({ sempreAoAbrir: true });

  return {
    carregando: query.isPending,
    erro:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar sua cota.")
        : null,
    tentandoDeNovo: query.isRefetching,
    cota: query.data ? cotaParaExibicao(query.data) : null,
    aoTentarDeNovo: () => void query.refetch(),
    aoVoltar: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/(prestador)");
      }
    },
  };
}

export type CotaDoMesViewModel = ReturnType<typeof useCotaDoMesViewModel>;
