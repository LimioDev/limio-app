import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { avaliar, buscarAvaliacaoPendente } from "./avaliacao.api";

export const chavesAvaliacao = {
  pendente: (anuncioId: string) => ["moderacao", "avaliacao", anuncioId] as const,
};

export function useAvaliacaoPendenteQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAvaliacao.pendente(anuncioId),
    queryFn: () => buscarAvaliacaoPendente(anuncioId),
    // A janela fecha com o tempo e a outra aba pode ter avaliado: sempre consulta de novo.
    staleTime: 0,
  });
}

/**
 * Recarrega a pendência também na falha: `AVALIACAO_DUPLICADA` e
 * `JANELA_AVALIACAO_ENCERRADA` querem dizer que o `podeAvaliar` na tela está velho.
 */
export function useAvaliarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: avaliar,
    onSettled: (_dados, _erro, { anuncioId }) =>
      queryClient.invalidateQueries({ queryKey: chavesAvaliacao.pendente(anuncioId) }),
  });
}
