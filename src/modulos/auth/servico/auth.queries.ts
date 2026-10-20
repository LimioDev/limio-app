import { useMutation } from "@tanstack/react-query";

import {
  alterarSenha,
  autenticar,
  cadastrarUsuario,
  encerrarSessao,
  redefinirSenha,
  revogarSessaoNaoSalva,
  solicitarRecuperacaoSenha,
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

export function useRevogarSessaoNaoSalvaMutation() {
  return useMutation({
    mutationFn: revogarSessaoNaoSalva,
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

export function useRecuperarSenhaMutation() {
  return useMutation({
    mutationFn: solicitarRecuperacaoSenha,
  });
}

export function useRedefinirSenhaMutation() {
  return useMutation({
    mutationFn: ({ token, novaSenha }: { token: string; novaSenha: string }) =>
      redefinirSenha(token, novaSenha),
  });
}

export function useAlterarSenhaMutation() {
  return useMutation({
    mutationFn: ({
      senhaAtual,
      novaSenha,
    }: {
      senhaAtual: string;
      novaSenha: string;
    }) => alterarSenha(senhaAtual, novaSenha),
  });
}
