import { useJanelasHorarioViewModel } from "../../../src/modulos/perfil/viewmodel/useJanelasHorarioViewModel";
import { JanelasHorarioView } from "../../../src/modulos/perfil/view/JanelasHorarioView";

export default function JanelasHorario() {
  const vm = useJanelasHorarioViewModel();
  return <JanelasHorarioView {...vm} />;
}
