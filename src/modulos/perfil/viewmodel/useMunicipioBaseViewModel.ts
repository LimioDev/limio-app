import { useRouter } from "expo-router";

import { useRascunhoAtuacao } from "../store/rascunhoAtuacao.store";
import { useBuscaMunicipio } from "./useBuscaMunicipio";

/** Seletor do município-base do Prestador: grava no rascunho da tela 10. */
export function useMunicipioBaseViewModel() {
  const router = useRouter();
  const definirMunicipio = useRascunhoAtuacao((estado) => estado.definirMunicipio);
  const atual = useRascunhoAtuacao((estado) => estado.rascunho?.municipio ?? null);
  const busca = useBuscaMunicipio(atual);

  return {
    ...busca,
    titulo: "Município-base",
    aoEscolher: (nome: string) => {
      if (busca.uf) {
        definirMunicipio({ nome, uf: busca.uf });
      }
      router.back();
    },
    aoVoltar: () => router.back(),
  };
}
