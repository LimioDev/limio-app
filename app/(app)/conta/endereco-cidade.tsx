import { useCidadeEnderecoViewModel } from "../../../src/modulos/perfil/viewmodel/useCidadeEnderecoViewModel";
import { SeletorMunicipioView } from "../../../src/modulos/perfil/view/SeletorMunicipioView";

export default function EnderecoCidade() {
  const vm = useCidadeEnderecoViewModel();
  return <SeletorMunicipioView {...vm} />;
}
