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
 * o cache. Espera a recarga pra a tela já voltar com a lista nova.
 */
function useRecarregarLista() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: chavesEndereco.lista });
}

export function useCriarEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: criarEndereco, onSuccess: recarregar });
}

export function useEditarEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: editarEndereco, onSuccess: recarregar });
}

export function useRemoverEnderecoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: removerEndereco, onSuccess: recarregar });
}

export function useMarcarEnderecoPadraoMutation() {
  const recarregar = useRecarregarLista();
  return useMutation({ mutationFn: marcarEnderecoPadrao, onSuccess: recarregar });
}
