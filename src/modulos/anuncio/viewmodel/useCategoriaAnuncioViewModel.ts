import { useRouter } from "expo-router";
import { useState } from "react";

import { normalizarBusca } from "../../../comum/lib/busca";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { useCategoriasQuery } from "../../../comum/servico/categoria.queries";
import { useEdicaoAnuncio } from "../store/edicaoAnuncio.store";
import { useRascunhoAnuncio } from "../store/rascunhoAnuncio.store";

/** De onde a tela 14a foi aberta: o anúncio novo (tela 14) ou a edição (tela 16a). */
export const FluxoCategoria = {
  CRIACAO: "CRIACAO",
  EDICAO: "EDICAO",
} as const;

export type FluxoCategoria = (typeof FluxoCategoria)[keyof typeof FluxoCategoria];

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
 * "Confirmar categoria", que grava no rascunho (ou na edição) e volta.
 */
export function useCategoriaAnuncioViewModel(fluxo: FluxoCategoria = FluxoCategoria.CRIACAO) {
  const router = useRouter();
  const query = useCategoriasQuery();
  const alterarRascunho = useRascunhoAnuncio((estado) => estado.alterar);
  const alterarEdicao = useEdicaoAnuncio((estado) => estado.alterar);
  const [selecionada, setSelecionada] = useState<string | null>(() =>
    fluxo === FluxoCategoria.EDICAO
      ? (useEdicaoAnuncio.getState().formulario.categoria?.id ?? null)
      : (useRascunhoAnuncio.getState().rascunho.categoria?.id ?? null),
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
        if (fluxo === FluxoCategoria.EDICAO) {
          alterarEdicao("categoria", escolhida);
        } else {
          alterarRascunho("categoria", escolhida);
        }
        router.back();
      }
    },
    aoVoltar: () => router.back(),
  };
}
