import { useQuery } from "@tanstack/react-query";

import { buscarCotaDoMes } from "./cota.api";

export const chavesCota = {
  mes: ["perfil", "cota"] as const,
};

/** Mesma chave na faixa do mural e na tela 33: abrir uma reaproveita a outra. */
export function useCotaDoMesQuery() {
  return useQuery({
    queryKey: chavesCota.mes,
    queryFn: buscarCotaDoMes,
  });
}
