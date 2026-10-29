import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  anexarFotoAnuncio,
  buscarAnuncio,
  buscarPainelEmpregador,
  cancelarAnuncio,
  criarAnuncio,
} from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
  detalhe: (id: string) => ["anuncio", "detalhe", id] as const,
};

export function usePainelEmpregadorQuery() {
  return useQuery({
    queryKey: chavesAnuncio.painelEmpregador,
    queryFn: buscarPainelEmpregador,
    // Candidatos chegam o tempo todo. A nova consulta ao voltar pra tela
    // (aba já montada) fica no `useFocusEffect` do ViewModel.
    staleTime: 0,
  });
}

export function useAnuncioQuery(id: string) {
  return useQuery({
    queryKey: chavesAnuncio.detalhe(id),
    queryFn: () => buscarAnuncio(id),
    // Mesmo motivo do painel; e os links das fotos são temporários.
    staleTime: 0,
  });
}

export function useCriarAnuncioMutation() {
  return useMutation({ mutationFn: criarAnuncio });
}

export function useAnexarFotoAnuncioMutation() {
  return useMutation({ mutationFn: anexarFotoAnuncio });
}

export function useCancelarAnuncioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarAnuncio,
    // A tela 13 deixa de listar o anúncio. Sem `await`: a volta pro Início
    // não espera a nova consulta do painel.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
    },
  });
}
