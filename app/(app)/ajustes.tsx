import { useAjustesViewModel } from "../../src/modulos/auth/viewmodel/useAjustesViewModel";
import { AjustesView } from "../../src/modulos/auth/view/AjustesView";

export default function Ajustes() {
  const vm = useAjustesViewModel();
  return <AjustesView {...vm} />;
}
