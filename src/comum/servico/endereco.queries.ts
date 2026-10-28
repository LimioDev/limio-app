import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { criarEndereco, listarEnderecos } from "./endereco.api";

export const chavesEndereco = {
  lista: ["perfil", "enderecos"] as const,
};

/** Endereços salvos do Empregador: "Endereços salvos" do perfil e passo 2 do anúncio. */
export function useEnderecosQuery({ habilitado = true } = {}) {
  return useQuery({
    queryKey: chavesEndereco.lista,
    queryFn: listarEnderecos,
    enabled: habilitado,
  });
}

/**
 * Cadastrar pode mudar o padrão e a ordem da lista, que é a da API: recarrega a
 * lista inteira, inclusive na falha (lista na tela velha). O `mutateAsync`
 * espera o `onSettled`, então quem chama já volta com a lista nova.
 */
export function useCriarEnderecoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarEndereco,
    onSettled: () => queryClient.invalidateQueries({ queryKey: chavesEndereco.lista }),
  });
}
