import { useEspecialidadesViewModel } from "../../../src/modulos/perfil/viewmodel/useEspecialidadesViewModel";
import { EspecialidadesView } from "../../../src/modulos/perfil/view/EspecialidadesView";

export default function Especialidades() {
  const vm = useEspecialidadesViewModel();
  return <EspecialidadesView {...vm} />;
}
