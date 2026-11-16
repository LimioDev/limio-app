import { useQuery } from "@tanstack/react-query";

import { buscarEnderecoPorCep } from "./cep.api";

export const chavesCep = {
  endereco: (cepDigitos: string) => ["cep", cepDigitos] as const,
};

/** Só consulta com os 8 dígitos completos. Sem retentativa: CEP errado não deve martelar o ViaCEP. */
export function useEnderecoPorCepQuery(cepDigitos: string) {
  return useQuery({
    queryKey: chavesCep.endereco(cepDigitos),
    queryFn: () => buscarEnderecoPorCep(cepDigitos),
    enabled: cepDigitos.length === 8,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
