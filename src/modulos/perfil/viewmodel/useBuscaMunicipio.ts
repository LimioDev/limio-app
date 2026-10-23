import { useState } from "react";

import { normalizarBusca } from "../servico/atuacao.helpers";
import { useMunicipiosQuery } from "../servico/atuacao.queries";
import type { MunicipioEscolhido } from "../store/rascunhoAtuacao.store";
import { UFS, type Uf } from "../tipos/perfil.enums";

/**
 * Estado comum dos seletores de município (município-base do Prestador e
 * cidade do endereço): escolhe a UF, depois busca na lista do IBGE. O nome vai
 * como o IBGE escreve, que é o que a geocodificação da API reconhece.
 */
export function useBuscaMunicipio(atual: MunicipioEscolhido | null) {
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
  };
}
