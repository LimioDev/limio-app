import { usePainelEmpregadorViewModel } from "../../../src/modulos/anuncio/viewmodel/usePainelEmpregadorViewModel";
import { PainelEmpregadorView } from "../../../src/modulos/anuncio/view/PainelEmpregadorView";
import { useSinoNotificacoesViewModel } from "../../../src/modulos/notificacao/viewmodel/useSinoNotificacoesViewModel";
import { SinoNotificacoesView } from "../../../src/modulos/notificacao/view/SinoNotificacoesView";
import { useCabecalhoInicioViewModel } from "../../../src/modulos/perfil/viewmodel/useCabecalhoInicioViewModel";
import { CabecalhoInicioView } from "../../../src/modulos/perfil/view/CabecalhoInicioView";

export default function Inicio() {
  const vm = usePainelEmpregadorViewModel();
  const cabecalho = useCabecalhoInicioViewModel();
  const sino = useSinoNotificacoesViewModel();
  return (
    <PainelEmpregadorView
      {...vm}
      cabecalho={<CabecalhoInicioView {...cabecalho} />}
      sino={<SinoNotificacoesView {...sino} />}
    />
  );
}
