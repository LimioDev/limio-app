import { useQuery } from "@tanstack/react-query";

import { buscarPainelEmpregador } from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
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
