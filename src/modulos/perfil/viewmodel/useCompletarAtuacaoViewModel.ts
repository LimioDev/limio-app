import { useRouter } from "expo-router";

import { usePerfilAtuacaoQuery } from "../servico/atuacao.queries";
import { ORIGEM_TROCA_PAPEL } from "./usePerfilAtuacaoViewModel";

/**
 * Parte do perfil no seletor de papel (tela 07): diz se o perfil de atuação
 * está incompleto (pelo `completo` da API) e leva à tela 10. Ao salvar lá, a
 * tela 10 conclui a troca pra Prestador. Substitui o modal "Perfil incompleto".
 */
export function useCompletarAtuacaoViewModel() {
  const router = useRouter();
  const query = usePerfilAtuacaoQuery();

  return {
    // Sem resposta da API (carregando ou erro), a troca segue como antes.
    prestadorIncompleto: query.data ? !query.data.completo : false,
    aoCompletarPerfilAtuacao: () =>
      router.replace({
        pathname: "/(app)/conta/atuacao",
        params: { origem: ORIGEM_TROCA_PAPEL },
      }),
  };
}
