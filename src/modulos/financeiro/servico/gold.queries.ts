import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { erroApi } from "../../../comum/lib/erros";
import { chavesCota } from "../../../comum/servico/cota.chaves";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  assinarGold,
  cancelarRenovacao,
  consultarMinhaAssinatura,
  consultarPlanoGold,
  trocarCartao,
} from "./gold.api";

/** `assinatura` fica dentro de `plano`: invalidar o plano recarrega as duas. */
export const chavesGold = {
  plano: ["financeiro", "gold"] as const,
  assinatura: ["financeiro", "gold", "assinatura"] as const,
};

/** Tela 34: preço do plano e cartão salvo. */
export function usePlanoGoldQuery(opcoes?: { sempreAoAbrir?: boolean }) {
  return useQuery({
    queryKey: chavesGold.plano,
    queryFn: consultarPlanoGold,
    refetchOnMount: opcoes?.sempreAoAbrir ? "always" : true,
  });
}

/** Tela 35: o card pede consultar sempre que ela abre. */
export function useMinhaAssinaturaQuery() {
  return useQuery({
    queryKey: chavesGold.assinatura,
    queryFn: consultarMinhaAssinatura,
    refetchOnMount: "always",
    // Nunca ter assinado é o estado normal de quem é FREE: repetir só atrasa
    // a tela e falha do mesmo jeito.
    retry: (falhas, erro) =>
      erroApi(erro)?.codigo !== CodigoErro.ASSINATURA_NAO_ENCONTRADA && falhas < 1,
  });
}

/**
 * Recarrega a cota no sucesso (a faixa do mural passa a mostrar o GOLD) e
 * também no `ASSINATURA_JA_ATIVA` (a cota na tela pode estar velha). O plano e
 * a assinatura são recarregados sempre: a cobrança grava o cartão usado.
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

/** A resposta já é a assinatura atualizada: entra direto no cache da tela 35. */
export function useCancelarRenovacaoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarRenovacao,
    onSuccess: (assinatura) => {
      queryClient.setQueryData(chavesGold.assinatura, assinatura);
    },
  });
}

/** O cartão novo aparece nas telas 34 e 35. */
export function useTrocarCartaoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trocarCartao,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chavesGold.plano }),
  });
}
