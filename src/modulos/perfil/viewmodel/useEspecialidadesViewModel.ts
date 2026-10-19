import { useRouter } from "expo-router";
import { useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { normalizarBusca } from "../servico/atuacao.helpers";
import { useCategoriasQuery } from "../servico/atuacao.queries";
import { useRascunhoAtuacao } from "../store/rascunhoAtuacao.store";

export interface ItemEspecialidade {
  id: string;
  nome: string;
  selecionada: boolean;
}

export interface GrupoEspecialidades {
  grupo: string;
  itens: ItemEspecialidade[];
}

function rotuloSalvar(quantidade: number): string {
  if (quantidade === 0) {
    return "Salvar sem especialidades";
  }
  return quantidade === 1
    ? "Salvar 1 especialidade"
    : `Salvar ${quantidade} especialidades`;
}

/**
 * Tela "Especialidades". A escolha fica local até "Salvar N especialidades",
 * que devolve pro rascunho da tela 10 — voltar sem salvar descarta.
 */
export function useEspecialidadesViewModel() {
  const router = useRouter();
  const query = useCategoriasQuery();
  const definirEspecialidades = useRascunhoAtuacao(
    (estado) => estado.definirEspecialidades,
  );
  const [selecionadas, setSelecionadas] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        useRascunhoAtuacao
          .getState()
          .rascunho?.especialidades.map((categoria) => categoria.id),
      ),
  );
  const [busca, setBusca] = useState("");

  const categorias = query.data ?? [];
  // Só conta o que ainda existe: categoria desativada sai da escolha.
  const quantidade = categorias.filter((c) => selecionadas.has(c.id)).length;

  const termo = normalizarBusca(busca);
  const grupos: GrupoEspecialidades[] = [];
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
      selecionada: selecionadas.has(categoria.id),
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
    contador: `${quantidade} de ${categorias.length} selecionadas`,
    grupos,
    semResultado: categorias.length > 0 && grupos.length === 0,
    aoAlternar: (id: string) =>
      setSelecionadas((atuais) => {
        const novas = new Set(atuais);
        if (novas.has(id)) {
          novas.delete(id);
        } else {
          novas.add(id);
        }
        return novas;
      }),
    rotuloSalvar: rotuloSalvar(quantidade),
    podeSalvar: query.isSuccess,
    aoSalvar: () => {
      definirEspecialidades(categorias.filter((c) => selecionadas.has(c.id)));
      router.back();
    },
    aoVoltar: () => router.back(),
  };
}
