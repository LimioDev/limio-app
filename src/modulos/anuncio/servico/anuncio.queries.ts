import { useMutation, useQuery } from "@tanstack/react-query";

import {
  anexarFotoAnuncio,
  buscarAnuncio,
  buscarPainelEmpregador,
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
    // Consulta a cada abertura da tela: candidatos chegam o tempo todo.
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
