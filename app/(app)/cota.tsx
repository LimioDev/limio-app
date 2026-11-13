import { useCotaDoMesViewModel } from "../../src/modulos/perfil/viewmodel/useCotaDoMesViewModel";
import { CotaDoMesView } from "../../src/modulos/perfil/view/CotaDoMesView";

export default function CotaDoMes() {
  const vm = useCotaDoMesViewModel();
  return <CotaDoMesView {...vm} />;
}
