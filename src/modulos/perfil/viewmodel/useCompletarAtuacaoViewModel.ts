import { useRouter } from "expo-router";

import { usePerfilAtuacaoQuery } from "../servico/atuacao.queries";
import { ORIGEM_TROCA_PAPEL } from "./usePerfilAtuacaoViewModel";

/**
 * Situação do perfil de atuação vista pelo seletor de papel:
 * - `verificando`: o GET ainda não respondeu; o card de Prestador fica travado
 *   pra um toque rápido não trocar de papel antes da resposta.
 * - `incompleto`: `completo = false` na API; o card leva a completar o perfil.
 * - `desconhecido`: o GET falhou. A troca não é travada (a tela 10 faz o
 *   mesmo GET e também falharia, prendendo o usuário), mas o atalho pra
 *   completar o perfil continua visível.
 * - `completo`: troca normal.
 */
export type SituacaoPerfilPrestador =
  | "verificando"
  | "incompleto"
  | "desconhecido"
  | "completo";

/**
 * Parte do perfil no seletor de papel (tela 07): diz se o perfil de atuação
 * está completo (pelo `completo` da API) e leva à tela 10. Ao salvar lá, a
 * tela 10 conclui a troca pra Prestador. Substitui o modal "Perfil incompleto".
 */
export function useCompletarAtuacaoViewModel() {
  const router = useRouter();
  const query = usePerfilAtuacaoQuery();

  let situacaoPerfilPrestador: SituacaoPerfilPrestador;
  if (query.data) {
    situacaoPerfilPrestador = query.data.completo ? "completo" : "incompleto";
  } else {
    situacaoPerfilPrestador = query.isError ? "desconhecido" : "verificando";
  }

  return {
    situacaoPerfilPrestador,
    aoCompletarPerfilAtuacao: () =>
      router.replace({
        pathname: "/(app)/conta/atuacao",
        params: { origem: ORIGEM_TROCA_PAPEL },
      }),
  };
}
