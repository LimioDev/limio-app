import { useRouter } from "expo-router";
import { useState } from "react";

import { normalizarBusca } from "../../../comum/lib/busca";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { useCategoriasQuery } from "../../../comum/servico/categoria.queries";
import { useRascunhoAnuncio } from "../store/rascunhoAnuncio.store";

export interface ItemCategoria {
  id: string;
  nome: string;
  selecionada: boolean;
}

export interface GrupoCategorias {
  grupo: string;
  itens: ItemCategoria[];
}

/**
 * Tela 14a "Categoria": uma só por anúncio. A escolha fica local até
 * "Confirmar categoria", que grava no rascunho e volta pra tela 14.
 */
export function useCategoriaAnuncioViewModel() {
  const router = useRouter();
  const query = useCategoriasQuery();
  const alterar = useRascunhoAnuncio((estado) => estado.alterar);
  const [selecionada, setSelecionada] = useState<string | null>(
    () => useRascunhoAnuncio.getState().rascunho.categoria?.id ?? null,
  );
  const [busca, setBusca] = useState("");

  const categorias = query.data ?? [];
  // Categoria desativada desde a última escolha sai da seleção.
  const escolhida = categorias.find((c) => c.id === selecionada) ?? null;

  const termo = normalizarBusca(busca);
  const grupos: GrupoCategorias[] = [];
  for (const categoria of categorias) {
    if (termo && !normalizarBusca(categoria.nome).includes(termo)) {
      continue;
    }
    let grupo = grupos.find((g) => g.grupo === categoria.grupo);
    if (!grupo) {
      grupo = { grupo: categoria.grupo, itens: [] };
      grupos.push(grupo);
    }
    grupo.itens.push({
      id: categoria.id,
      nome: categoria.nome,
      selecionada: categoria.id === escolhida?.id,
    });
  }

  return {
    carregando: query.isPending,
    erroCarregamento: query.isError
      ? mensagemErroApi(query.error, "Não foi possível carregar as categorias.")
      : null,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    busca,
    aoBuscar: setBusca,
    grupos,
    semResultado: categorias.length > 0 && grupos.length === 0,
    aoEscolher: setSelecionada,
    podeConfirmar: escolhida !== null,
    aoConfirmar: () => {
      if (escolhida) {
        alterar("categoria", escolhida);
        router.back();
      }
    },
    aoVoltar: () => router.back(),
  };
}
