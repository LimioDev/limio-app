import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { buscarPerfilAtuacao, salvarPerfilAtuacao } from "./atuacao.api";

export const chavesAtuacao = {
  perfil: ["perfil", "atuacao"] as const,
};

export function usePerfilAtuacaoQuery({ habilitado = true } = {}) {
  return useQuery({
    queryKey: chavesAtuacao.perfil,
    queryFn: buscarPerfilAtuacao,
    enabled: habilitado,
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
