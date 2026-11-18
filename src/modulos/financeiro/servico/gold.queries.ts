import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesCota } from "../../../comum/servico/cota.chaves";
import { assinarGold, consultarPlanoGold } from "./gold.api";

export const chavesGold = {
  plano: ["financeiro", "gold"] as const,
};

/** Mesma chave nas telas 34 e 35: a 35 reaproveita o preço e o cartão da 34. */
export function usePlanoGoldQuery(opcoes?: { sempreAoAbrir?: boolean }) {
  return useQuery({
    queryKey: chavesGold.plano,
    queryFn: consultarPlanoGold,
    refetchOnMount: opcoes?.sempreAoAbrir ? "always" : true,
  });
}

/**
 * Recarrega a cota no sucesso (a faixa do mural passa a mostrar o GOLD) e
 * também no `ASSINATURA_JA_ATIVA` (a cota na tela pode estar velha). O plano é
 * recarregado sempre: a cobrança grava o cartão usado.
 */
export function useAssinarGoldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assinarGold,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: chavesCota.mes }),
        queryClient.invalidateQueries({ queryKey: chavesGold.plano }),
      ]),
  });
}
