import { useLocalSearchParams } from "expo-router";

import { useAvaliacaoViewModel } from "../../../src/modulos/moderacao/viewmodel/useAvaliacaoViewModel";
import { AvaliacaoView } from "../../../src/modulos/moderacao/view/AvaliacaoView";

export default function Avaliacao() {
  const { anuncioId } = useLocalSearchParams<{ anuncioId: string }>();
  const vm = useAvaliacaoViewModel(anuncioId);
  return <AvaliacaoView {...vm} />;
}
