import { useQuery } from "@tanstack/react-query";

import { erroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import type { PapelDoApp } from "../../../comum/tipos/papel";
import { buscarPerfilPublico } from "./perfilPublico.api";

export const chavesPerfilPublico = {
  perfil: (usuarioId: string, papel: PapelDoApp | null) =>
    ["perfil", "publico", usuarioId, papel] as const,
};

/** Sem `papel` válido na rota, não consulta: a tela trata como perfil não encontrado. */
export function usePerfilPublicoQuery(usuarioId: string, papel: PapelDoApp | null) {
  return useQuery({
    queryKey: chavesPerfilPublico.perfil(usuarioId, papel),
    queryFn: () => buscarPerfilPublico(usuarioId, papel as PapelDoApp),
    enabled: !!usuarioId && papel !== null,
    // 404 não muda numa segunda tentativa.
    retry: (falhas, erro) =>
      erroApi(erro)?.codigo !== CodigoErro.PERFIL_NAO_ENCONTRADO && falhas < 1,
  });
}
