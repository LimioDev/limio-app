import { useMeuPerfilViewModel } from "../../../src/modulos/perfil/viewmodel/useMeuPerfilViewModel";
import { MeuPerfilView } from "../../../src/modulos/perfil/view/MeuPerfilView";

export default function MeuPerfil() {
  const vm = useMeuPerfilViewModel();
  return <MeuPerfilView {...vm} />;
}
