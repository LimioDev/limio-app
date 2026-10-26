import { useRouter } from "expo-router";

import { useBuscaMunicipio } from "../../../comum/hooks/useBuscaMunicipio";
import { useRascunhoAnuncio } from "../store/rascunhoAnuncio.store";

/** Seletor de "Cidade e UF" do endereço avulso, na lista de municípios do IBGE. */
export function useCidadeAvulsoViewModel() {
  const router = useRouter();
  const atual = useRascunhoAnuncio((estado) => estado.cidadeAvulso);
  const definir = useRascunhoAnuncio((estado) => estado.definirCidadeAvulso);
  const busca = useBuscaMunicipio(atual);

  return {
    ...busca,
    titulo: "Cidade e UF",
    aoEscolher: (nome: string) => {
      if (busca.uf) {
        definir({ nome, uf: busca.uf });
      }
      router.back();
    },
    aoVoltar: () => router.back(),
  };
}
