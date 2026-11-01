import { useLocalSearchParams } from "expo-router";

import { useDetalheAnuncioMuralViewModel } from "../../../src/modulos/anuncio/viewmodel/useDetalheAnuncioMuralViewModel";
import { DetalheAnuncioMuralView } from "../../../src/modulos/anuncio/view/DetalheAnuncioMuralView";

export default function DetalheAnuncioMural() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useDetalheAnuncioMuralViewModel(id);
  return <DetalheAnuncioMuralView {...vm} />;
}
