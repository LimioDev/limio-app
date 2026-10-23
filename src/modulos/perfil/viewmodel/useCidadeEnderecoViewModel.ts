import { useRouter } from "expo-router";

import { useCidadeEndereco } from "../store/cidadeEndereco.store";
import { useBuscaMunicipio } from "./useBuscaMunicipio";

/** Seletor de "Cidade e UF" do endereço, na lista de municípios do IBGE. */
export function useCidadeEnderecoViewModel() {
  const router = useRouter();
  const atual = useCidadeEndereco((estado) => estado.cidade);
  const definir = useCidadeEndereco((estado) => estado.definir);
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
