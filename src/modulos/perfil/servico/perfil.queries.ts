import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ContatoResponse,
  PerfilEmpregadorResponse,
} from "../tipos/perfil.types";
import {
  buscarMeuPerfil,
  editarNomeExibicao,
  trocarEmail,
  trocarTelefone,
} from "./perfil.api";

export const chavesPerfil = {
  meuPerfil: ["perfil", "meu"] as const,
};

export function useMeuPerfilQuery() {
  return useQuery({
    queryKey: chavesPerfil.meuPerfil,
    queryFn: buscarMeuPerfil,
  });
}

export function useEditarNomeExibicaoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editarNomeExibicao,
    onSuccess: (perfil) => {
      queryClient.setQueryData(chavesPerfil.meuPerfil, perfil);
    },
  });
}

/** A troca devolve só o contato: junta no perfil em cache. */
function useAtualizarContatoEmCache() {
  const queryClient = useQueryClient();
  return (contato: ContatoResponse) => {
    queryClient.setQueryData<PerfilEmpregadorResponse>(
      chavesPerfil.meuPerfil,
      (perfil) => (perfil ? { ...perfil, ...contato } : perfil),
    );
  };
}

export function useTrocarEmailMutation() {
  const atualizarContato = useAtualizarContatoEmCache();
  return useMutation({
    mutationFn: trocarEmail,
    onSuccess: atualizarContato,
  });
}

export function useTrocarTelefoneMutation() {
  const atualizarContato = useAtualizarContatoEmCache();
  return useMutation({
    mutationFn: trocarTelefone,
    onSuccess: atualizarContato,
  });
}
