import { useCidadeEnderecoViewModel } from "../../../src/modulos/perfil/viewmodel/useCidadeEnderecoViewModel";
import { MunicipioBaseView } from "../../../src/modulos/perfil/view/MunicipioBaseView";

export default function EnderecoCidade() {
  const vm = useCidadeEnderecoViewModel();
  return <MunicipioBaseView {...vm} />;
}
