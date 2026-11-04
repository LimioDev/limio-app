import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

import { formatarEscolhasUsadas, formatarRenovacao } from "../servico/cota.helpers";
import { useCotaDoMesQuery } from "../servico/cota.queries";
import { Plano } from "../tipos/cota.enums";

/** Ao voltar pra aba do mural, cota mais velha que isso é consultada de novo. */
const IDADE_MAXIMA_MS = 30_000;

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
  // do lado do Empregador. Ao voltar pra aba, consulta de novo se envelheceu.
  const { refetch } = query;
  const atualizadoEm = useRef(0);
  useEffect(() => {
    atualizadoEm.current = query.dataUpdatedAt;
  }, [query.dataUpdatedAt]);
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      if (Date.now() - atualizadoEm.current > IDADE_MAXIMA_MS) {
        void refetch();
      }
    }, [refetch]),
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
