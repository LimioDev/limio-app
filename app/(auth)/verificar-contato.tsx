import { useVerificarCelularViewModel } from "../../src/modulos/auth/viewmodel/useVerificarCelularViewModel";
import { VerificarCelularView } from "../../src/modulos/auth/view/VerificarCelularView";

export default function VerificarContato() {
  const vm = useVerificarCelularViewModel();
  return <VerificarCelularView {...vm} />;
}
