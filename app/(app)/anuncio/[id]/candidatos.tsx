import { useLocalSearchParams } from "expo-router";

import { useCandidatosViewModel } from "../../../../src/modulos/anuncio/viewmodel/useCandidatosViewModel";
import { CandidatosView } from "../../../../src/modulos/anuncio/view/CandidatosView";

/** Telas 18 "Candidatos" e 19 "Candidatos vazio" — "Ver todos" da tela 16. */
export default function Candidatos() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useCandidatosViewModel(id);
  return <CandidatosView {...vm} />;
}
