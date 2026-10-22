import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FotoPerfilResponse } from "../tipos/fotoPerfil.types";
import { buscarFotoPerfil, enviarFotoPerfil } from "./fotoPerfil.api";
import { chavesPerfil } from "./perfil.queries";

// Consulta de novo um pouco antes do link vencer, pra a tela nunca ficar com URL morta.
const MARGEM_RENOVACAO_MS = 5 * 60_000;

/** Tempo até o link temporário precisar ser trocado; sem foto, segue o padrão do app. */
function validadeDoLink(foto: FotoPerfilResponse | null | undefined): number {
  if (!foto) {
    return 30_000;
  }
  const restante = Date.parse(foto.expiraEm) - Date.now() - MARGEM_RENOVACAO_MS;
  return Number.isFinite(restante) ? Math.max(restante, 0) : 0;
}

export function useFotoPerfilQuery() {
  return useQuery({
    queryKey: chavesPerfil.fotoPerfil,
    queryFn: buscarFotoPerfil,
    staleTime: (query) => validadeDoLink(query.state.data),
  });
}

export function useEnviarFotoPerfilMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enviarFotoPerfil,
    // A resposta já traz o link da foto nova: "Meu perfil" e o "Início" leem
    // do mesmo cache e trocam juntos. No erro o cache fica como estava.
    onSuccess: (foto) => {
      queryClient.setQueryData(chavesPerfil.fotoPerfil, foto);
    },
  });
}
