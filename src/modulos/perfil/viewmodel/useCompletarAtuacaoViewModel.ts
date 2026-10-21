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
    // ❯ [AJUSTAR] Enquanto o perfil carrega ou se o GET falha, o Prestador troca direto, sem completar o perfil.
    //Por quê: `prestadorIncompleto` vale `false` sem `query.data`; tocar rápido ou estar sem rede
    // Sugestão: expor `verificandoPrestador: query.isPending` e desabilitar o card de Prestador enquanto ele for `true`; no erro, tratar como incompleto.
    prestadorIncompleto: query.data ? !query.data.completo : false,
    aoCompletarPerfilAtuacao: () =>
      router.replace({
        pathname: "/(app)/conta/atuacao",
        params: { origem: ORIGEM_TROCA_PAPEL },
      }),
  };
}
