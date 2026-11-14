import { useLocalSearchParams } from "expo-router";

import { EscolherPrestadorView } from "../../src/modulos/anuncio/view/EscolherPrestadorView";
import { useEscolherPrestadorViewModel } from "../../src/modulos/anuncio/viewmodel/useEscolherPrestadorViewModel";

/**
 * Telas 23 "Escolher (nome)?" e 24 "Não foi possível escolher (nome)": folha
 * transparente por cima da tela 18 ou do chat (tela 21).
 */
export default function EscolherPrestador() {
  const { anuncioId, candidaturaId } = useLocalSearchParams<{
    anuncioId: string;
    candidaturaId: string;
  }>();
  const vm = useEscolherPrestadorViewModel(anuncioId, candidaturaId);
  return <EscolherPrestadorView {...vm} />;
}
