import { useLocalSearchParams } from "expo-router";

import { ServicoCombinadoView } from "../../../../src/modulos/anuncio/view/ServicoCombinadoView";
import { useServicoCombinadoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useServicoCombinadoViewModel";

/** Tela 25 "Serviço combinado" do Empregador; o `id` é o do anúncio. */
export default function ServicoCombinado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useServicoCombinadoViewModel(id);
  return <ServicoCombinadoView {...vm} />;
}
