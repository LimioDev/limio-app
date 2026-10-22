import { useRouter } from "expo-router";
import { useState } from "react";

import { normalizarBusca } from "../servico/atuacao.helpers";
import { useMunicipiosQuery } from "../servico/atuacao.queries";
import { useRascunhoAtuacao } from "../store/rascunhoAtuacao.store";
import { UFS, type Uf } from "../tipos/perfil.enums";

/**
 * Seletor do município-base: escolhe a UF, depois busca o município na lista
 * do IBGE. O nome vai como o IBGE escreve, que é o que a geocodificação da
 * API reconhece.
 */
export function useMunicipioBaseViewModel() {
  const router = useRouter();
  const definirMunicipio = useRascunhoAtuacao((estado) => estado.definirMunicipio);
  const atual = useRascunhoAtuacao((estado) => estado.rascunho?.municipio ?? null);
  const [uf, setUf] = useState<Uf | null>(atual?.uf ?? null);
  const [busca, setBusca] = useState("");
  const query = useMunicipiosQuery(uf);

  const termo = normalizarBusca(busca);
  const municipios = (query.data ?? [])
    .filter((m) => !termo || normalizarBusca(m.nome).includes(termo))
    .map((m) => ({
      id: m.id,
      nome: m.nome,
      selecionado: atual?.uf === uf && atual?.nome === m.nome,
    }));

  return {
    ufs: UFS,
    uf,
    aoEscolherUf: (nova: Uf) => {
      setUf(nova);
      setBusca("");
    },
    busca,
    aoBuscar: setBusca,
    carregando: uf !== null && query.isPending,
    erro: query.isError
      ? "Não foi possível carregar os municípios. Verifique sua conexão."
      : null,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    municipios,
    semResultado: query.isSuccess && municipios.length === 0,
    aoEscolher: (nome: string) => {
      if (uf) {
        definirMunicipio({ nome, uf });
      }
      router.back();
    },
    aoVoltar: () => router.back(),
  };
}
