import { useQuery } from "@tanstack/react-query";

import { listarEnderecos } from "./endereco.api";

export const chavesEndereco = {
  lista: ["perfil", "enderecos"] as const,
};

/** Endereços salvos do Empregador: "Endereços salvos" do perfil e passo 2 do anúncio. */
export function useEnderecosQuery({ habilitado = true } = {}) {
  return useQuery({
    queryKey: chavesEndereco.lista,
    queryFn: listarEnderecos,
    enabled: habilitado,
  });
}
