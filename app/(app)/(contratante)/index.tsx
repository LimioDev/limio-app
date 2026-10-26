import { usePainelEmpregadorViewModel } from "../../../src/modulos/anuncio/viewmodel/usePainelEmpregadorViewModel";
import { PainelEmpregadorView } from "../../../src/modulos/anuncio/view/PainelEmpregadorView";

export default function Inicio() {
  const vm = usePainelEmpregadorViewModel();
  return <PainelEmpregadorView {...vm} />;
}
