import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  criarEndereco,
  editarEndereco,
  listarEnderecos,
  marcarEnderecoPadrao,
  removerEndereco,
} from "./endereco.api";

export const chavesEndereco = {
  lista: ["perfil", "enderecos"] as const,
};

export function useEnderecosQuery({ habilitado = true } = {}) {
  return useQuery({
    queryKey: chavesEndereco.lista,
    queryFn: listarEnderecos,
    enabled: habilitado,
  });
}

/**
 * Toda escrita pode mexer em outros itens (o padrão muda de endereço) e na
 * ordem da lista, que é a da API: recarrega a lista inteira em vez de remendar
 * o cache. Recarrega também na falha: `ENDERECO_NAO_ENCONTRADO` e
 * `ENDERECO_PADRAO_CONFLITO` querem dizer que a lista na tela está velha.
 * O `mutateAsync` espera o `onSettled`, então a tela já volta com a lista nova.
 */
function useRecarregarLista() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: chavesEndereco.lista });
}

export function useCriarEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: criarEndereco, onSettled: recarregar });
}

export function useEditarEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: editarEndereco, onSettled: recarregar });
}

export function useRemoverEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: removerEndereco, onSettled: recarregar });
}

export function useMarcarEnderecoPadraoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: marcarEnderecoPadrao, onSettled: recarregar });
}
