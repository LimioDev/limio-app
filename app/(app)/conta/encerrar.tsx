import { useEncerrarContaViewModel } from "../../../src/modulos/conta/viewmodel/useEncerrarContaViewModel";
import { EncerrarContaView } from "../../../src/modulos/conta/view/EncerrarContaView";

export default function EncerrarConta() {
  const vm = useEncerrarContaViewModel();
  return <EncerrarContaView {...vm} />;
}
