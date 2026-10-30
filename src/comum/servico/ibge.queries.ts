import { useQuery } from "@tanstack/react-query";

import type { Uf } from "../tipos/localidade";
import { listarMunicipios } from "./ibge.api";

export const chavesIbge = {
  municipios: (uf: Uf | null) => ["ibge", "municipios", uf] as const,
};

/** Lista de municípios muda raramente: fica em cache a sessão inteira. */
export function useMunicipiosQuery(uf: Uf | null) {
  return useQuery({
    queryKey: chavesIbge.municipios(uf),
    queryFn: () => listarMunicipios(uf!),
    enabled: uf !== null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
