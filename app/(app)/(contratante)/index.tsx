import { usePainelEmpregadorViewModel } from "../../../src/modulos/anuncio/viewmodel/usePainelEmpregadorViewModel";
import { PainelEmpregadorView } from "../../../src/modulos/anuncio/view/PainelEmpregadorView";
import { useCabecalhoInicioViewModel } from "../../../src/modulos/perfil/viewmodel/useCabecalhoInicioViewModel";
import { CabecalhoInicioView } from "../../../src/modulos/perfil/view/CabecalhoInicioView";

export default function Inicio() {
  const vm = usePainelEmpregadorViewModel();
  const cabecalho = useCabecalhoInicioViewModel();
  return <PainelEmpregadorView {...vm} cabecalho={<CabecalhoInicioView {...cabecalho} />} />;
}
