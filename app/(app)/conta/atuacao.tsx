import { usePerfilAtuacaoViewModel } from "../../../src/modulos/perfil/viewmodel/usePerfilAtuacaoViewModel";
import { PerfilAtuacaoView } from "../../../src/modulos/perfil/view/PerfilAtuacaoView";

export default function Atuacao() {
  const vm = usePerfilAtuacaoViewModel();
  return <PerfilAtuacaoView {...vm} />;
}
