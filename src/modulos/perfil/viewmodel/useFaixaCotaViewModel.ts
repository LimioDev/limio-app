import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

import { formatarEscolhasUsadas, formatarRenovacao } from "../servico/cota.helpers";
import { chavesCota, useCotaDoMesQuery } from "../servico/cota.queries";
import { Plano } from "../tipos/cota.enums";

export type FaixaCotaExibida =
  | {
      plano: typeof Plano.FREE;
      /** "2 de 4 escolhas usadas". */
      usadas: string;
      escolhasConsumidas: number;
      teto: number;
      /** "Renova em 1º de setembro". */
      renovacao: string;
    }
  | {
      plano: typeof Plano.GOLD;
      /** "Renova em 1º de setembro, 00:00". */
      renovacao: string;
    };

/**
 * Faixa de cota do topo do mural (tela 28 e 28c). Falha ou carregamento não
 * mostram nada: a faixa some e o mural continua funcionando.
 */
export function useFaixaCotaViewModel() {
  const router = useRouter();
  const query = useCotaDoMesQuery();

  // A aba do mural continua montada; a escolha que consome a cota acontece
  // do lado do Empregador. Ao voltar pra aba, consulta de novo se envelheceu
  // (`staleTime` global). `cancelRefetch: false` não derruba a consulta da montagem.
  const queryClient = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      void queryClient.refetchQueries(
        { queryKey: chavesCota.mes, stale: true },
        { cancelRefetch: false },
      );
    }, [queryClient]),
  );

  const cota = query.data;
  let faixa: FaixaCotaExibida | null = null;
  if (cota?.plano === Plano.GOLD) {
    faixa = { plano: Plano.GOLD, renovacao: formatarRenovacao(cota.renovaEm, true) };
  } else if (cota && cota.tetoAplicado !== null) {
    faixa = {
      plano: Plano.FREE,
      usadas: formatarEscolhasUsadas(cota.escolhasConsumidas, cota.tetoAplicado),
      escolhasConsumidas: cota.escolhasConsumidas,
      teto: cota.tetoAplicado,
      renovacao: formatarRenovacao(cota.renovaEm),
    };
  }

  return {
    faixa,
    aoAbrirCota: () => router.push("/(app)/cota"),
  };
}

export type FaixaCotaViewModel = ReturnType<typeof useFaixaCotaViewModel>;
