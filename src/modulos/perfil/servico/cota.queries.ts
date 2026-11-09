import { useQuery } from "@tanstack/react-query";

import { buscarCotaDoMes } from "./cota.api";

export const chavesCota = {
  mes: ["perfil", "cota"] as const,
};

/**
 * Mesma chave na faixa do mural e na tela 33: abrir uma reaproveita a outra.
 * `sempreAoAbrir` mostra o cache na hora e consulta a API mesmo com ele novo.
 */
export function useCotaDoMesQuery(opcoes?: { sempreAoAbrir?: boolean }) {
  return useQuery({
    queryKey: chavesCota.mes,
    queryFn: buscarCotaDoMes,
    refetchOnMount: opcoes?.sempreAoAbrir ? "always" : true,
  });
}
