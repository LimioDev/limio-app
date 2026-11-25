import { useLocalSearchParams } from "expo-router";

import { SeuServicoView } from "../../../src/modulos/anuncio/view/SeuServicoView";
import { useSeuServicoViewModel } from "../../../src/modulos/anuncio/viewmodel/useSeuServicoViewModel";
import { usePlanoDoPrestadorViewModel } from "../../../src/modulos/perfil/viewmodel/usePlanoDoPrestadorViewModel";

/** Telas 36/37 "Seu serviço"; o `id` é o do anúncio (o serviço é o anúncio depois da escolha). */
export default function Servico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // O plano vem do perfil; a rota junta os dois módulos.
  const { ehGold } = usePlanoDoPrestadorViewModel();
  const vm = useSeuServicoViewModel(id, ehGold);
  return <SeuServicoView {...vm} />;
}
