import { useLocalSearchParams } from "expo-router";

import { SeuServicoView } from "../../../src/modulos/anuncio/view/SeuServicoView";
import { useSeuServicoViewModel } from "../../../src/modulos/anuncio/viewmodel/useSeuServicoViewModel";

/** Telas 36/37 "Seu serviço"; o `id` é o do anúncio (o serviço é o anúncio depois da escolha). */
export default function Servico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useSeuServicoViewModel(id);
  return <SeuServicoView {...vm} />;
}
