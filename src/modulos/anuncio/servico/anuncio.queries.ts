import { useQuery } from "@tanstack/react-query";

import { buscarPainelEmpregador } from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
};

export function usePainelEmpregadorQuery() {
  return useQuery({
    queryKey: chavesAnuncio.painelEmpregador,
    queryFn: buscarPainelEmpregador,
    // Consulta a cada abertura da tela: candidatos chegam o tempo todo.
    staleTime: 0,
  });
}
