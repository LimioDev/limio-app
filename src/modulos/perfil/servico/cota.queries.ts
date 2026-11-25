import { useQuery } from "@tanstack/react-query";

import { chavesCota } from "../../../comum/servico/cota.chaves";
import { buscarCotaDoMes } from "./cota.api";

/**
 * Mesma chave na faixa do mural e na tela 33: abrir uma reaproveita a outra.
 * `sempreAoAbrir` mostra o cache na hora e consulta a API mesmo com ele novo.
 * Meu perfil também lê, no "Plano e cota".
 */
export function useCotaDoMesQuery(opcoes?: { sempreAoAbrir?: boolean; habilitado?: boolean }) {
  return useQuery({
    queryKey: chavesCota.mes,
    queryFn: buscarCotaDoMes,
    refetchOnMount: opcoes?.sempreAoAbrir ? "always" : true,
    // Meu perfil só consulta no papel Prestador (a rota é só dele).
    enabled: opcoes?.habilitado ?? true,
  });
}
