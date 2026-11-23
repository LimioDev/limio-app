import { useLocalSearchParams } from "expo-router";

import { useCotaDoMesQuery } from "../../../src/modulos/perfil/servico/cota.queries";
import { Plano } from "../../../src/modulos/perfil/tipos/cota.enums";
import { SeuServicoView } from "../../../src/modulos/anuncio/view/SeuServicoView";
import { useSeuServicoViewModel } from "../../../src/modulos/anuncio/viewmodel/useSeuServicoViewModel";

/** Telas 36/37 "Seu serviço"; o `id` é o do anúncio (o serviço é o anúncio depois da escolha). */
export default function Servico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cota = useCotaDoMesQuery();
  const ehGold = cota.data?.plano === Plano.GOLD;
  const vm = useSeuServicoViewModel(id, ehGold);
  return <SeuServicoView {...vm} />;
}
