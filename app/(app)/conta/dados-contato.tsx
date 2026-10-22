import { useDadosContatoViewModel } from "../../../src/modulos/perfil/viewmodel/useDadosContatoViewModel";
import { DadosContatoView } from "../../../src/modulos/perfil/view/DadosContatoView";

export default function DadosContato() {
  const vm = useDadosContatoViewModel();
  return <DadosContatoView {...vm} />;
}
