import { useCidadeEnderecoViewModel } from "../../../src/modulos/perfil/viewmodel/useCidadeEnderecoViewModel";
import { SeletorMunicipioView } from "../../../src/comum/componentes/localidade/SeletorMunicipioView";

export default function EnderecoCidade() {
  const vm = useCidadeEnderecoViewModel();
  return <SeletorMunicipioView {...vm} />;
}
