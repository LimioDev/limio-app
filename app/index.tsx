import { useBoasVindasViewModel } from "../src/modulos/auth/viewmodel/useBoasVindasViewModel";
import { BoasVindasView } from "../src/modulos/auth/view/BoasVindasView";

export default function Index() {
  const vm = useBoasVindasViewModel();
  return <BoasVindasView {...vm} />;
}
