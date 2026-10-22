import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Uf } from "../tipos/perfil.enums";
import {
  buscarPerfilAtuacao,
  listarCategorias,
  salvarPerfilAtuacao,
} from "./atuacao.api";
import { listarMunicipios } from "./ibge.api";

export const chavesAtuacao = {
  perfil: ["perfil", "atuacao"] as const,
  categorias: ["perfil", "categorias"] as const,
  municipios: (uf: Uf | null) => ["ibge", "municipios", uf] as const,
};

export function usePerfilAtuacaoQuery({ habilitado = true } = {}) {
  return useQuery({
    queryKey: chavesAtuacao.perfil,
    queryFn: buscarPerfilAtuacao,
    enabled: habilitado,
  });
}

export function useCategoriasQuery() {
  return useQuery({
    queryKey: chavesAtuacao.categorias,
    queryFn: listarCategorias,
  });
}

/** Lista de municípios muda raramente: fica em cache a sessão inteira. */
export function useMunicipiosQuery(uf: Uf | null) {
  return useQuery({
    queryKey: chavesAtuacao.municipios(uf),
    queryFn: () => listarMunicipios(uf!),
    enabled: uf !== null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useSalvarPerfilAtuacaoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salvarPerfilAtuacao,
    onSuccess: (perfil) => {
      queryClient.setQueryData(chavesAtuacao.perfil, perfil);
    },
  });
}
