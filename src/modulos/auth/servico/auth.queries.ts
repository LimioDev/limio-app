import { useMutation } from "@tanstack/react-query";

import {
  autenticar,
  cadastrarUsuario,
  encerrarSessao,
  trocarPapelAtivo,
} from "./auth.api";

export function useCadastrarUsuarioMutation() {
  return useMutation({
    mutationFn: cadastrarUsuario,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      autenticar(email, senha),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: encerrarSessao,
  });
}

export function useTrocarPapelMutation() {
  return useMutation({
    mutationFn: trocarPapelAtivo,
  });
}
