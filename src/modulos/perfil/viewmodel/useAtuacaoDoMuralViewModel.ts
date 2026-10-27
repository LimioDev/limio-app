import { useMemo } from "react";

import { useCategoriasQuery, usePerfilAtuacaoQuery } from "../servico/atuacao.queries";

export interface CategoriaDoMural {
  id: string;
  nome: string;
}

export interface AtuacaoDoMural {
  /** Catálogo inteiro, pro "3 de 12 categorias" dos filtros. */
  categorias: CategoriaDoMural[];
  /** Atalhos do topo do mural, depois do "Todas". */
  especialidades: CategoriaDoMural[];
  /** Raio do perfil: teto do controle de raio, já que o filtro só reduz. */
  raioMaximoKm: number | null;
}

/**
 * Parte do perfil de atuação que o mural (módulo `anuncio`) usa. A rota junta
 * os dois, pra `anuncio` não importar `perfil`. Quem decide o que é compatível
 * continua sendo a API.
 */
export function useAtuacaoDoMuralViewModel(): AtuacaoDoMural {
  const categorias = useCategoriasQuery();
  const perfil = usePerfilAtuacaoQuery();

  return useMemo(
    () => ({
      categorias: (categorias.data ?? []).map(({ id, nome }) => ({ id, nome })),
      especialidades: (perfil.data?.especialidades ?? []).map(({ id, nome }) => ({
        id,
        nome,
      })),
      raioMaximoKm: perfil.data?.raioAtendimentoKm ?? null,
    }),
    [categorias.data, perfil.data],
  );
}
