import { useAjustesViewModel } from "../../src/modulos/auth/viewmodel/useAjustesViewModel";
import { AjustesView } from "../../src/modulos/auth/view/AjustesView";
import { usePreferenciasNotificacaoViewModel } from "../../src/modulos/conta/viewmodel/usePreferenciasNotificacaoViewModel";
import { PreferenciasNotificacaoView } from "../../src/modulos/conta/view/PreferenciasNotificacaoView";

export default function Ajustes() {
  const vm = useAjustesViewModel();
  const vmNotificacoes = usePreferenciasNotificacaoViewModel();
  return (
    <AjustesView
      {...vm}
      secaoNotificacoes={<PreferenciasNotificacaoView {...vmNotificacoes} />}
    />
  );
}
