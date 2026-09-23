import { useMutation } from "@tanstack/react-query";

import { cadastrarUsuario } from "./auth.api";

export function useCadastrarUsuarioMutation() {
  return useMutation({
    mutationFn: cadastrarUsuario,
  });
}
