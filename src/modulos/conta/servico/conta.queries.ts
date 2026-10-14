import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PreferenciasNotificacao } from "../tipos/conta.types";
import {
  atualizarPreferenciasNotificacao,
  buscarPreferenciasNotificacao,
} from "./conta.api";

const CHAVE_PREFERENCIAS_NOTIFICACAO = [
  "conta",
  "preferencias-notificacao",
] as const;

export function usePreferenciasNotificacaoQuery() {
  return useQuery({
    queryKey: CHAVE_PREFERENCIAS_NOTIFICACAO,
    queryFn: buscarPreferenciasNotificacao,
    // Busca de novo a cada abertura de Ajustes: pode ter mudado em outro aparelho.
    staleTime: 0,
  });
}

/** Otimista: o toggle muda na hora e volta ao estado anterior se a API recusar. */
export function useAtualizarPreferenciasNotificacaoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: atualizarPreferenciasNotificacao,
    onMutate: async (novas) => {
      await queryClient.cancelQueries({
        queryKey: CHAVE_PREFERENCIAS_NOTIFICACAO,
      });
      const anteriores = queryClient.getQueryData<PreferenciasNotificacao>(
        CHAVE_PREFERENCIAS_NOTIFICACAO,
      );
      queryClient.setQueryData(CHAVE_PREFERENCIAS_NOTIFICACAO, novas);
      return { anteriores };
    },
    onError: (_erro, _novas, contexto) => {
      if (contexto?.anteriores) {
        queryClient.setQueryData(
          CHAVE_PREFERENCIAS_NOTIFICACAO,
          contexto.anteriores,
        );
      }
    },
    onSuccess: (salvas) => {
      queryClient.setQueryData(CHAVE_PREFERENCIAS_NOTIFICACAO, salvas);
    },
  });
}
