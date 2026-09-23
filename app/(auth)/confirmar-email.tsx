import { useConfirmarEmailViewModel } from "../../src/modulos/auth/viewmodel/useConfirmarEmailViewModel";
import { ConfirmarEmailView } from "../../src/modulos/auth/view/ConfirmarEmailView";

export default function ConfirmarEmail() {
  const vm = useConfirmarEmailViewModel();
  return <ConfirmarEmailView {...vm} />;
}
