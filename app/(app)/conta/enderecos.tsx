import { useEnderecosSalvosViewModel } from "../../../src/modulos/perfil/viewmodel/useEnderecosSalvosViewModel";
import { EnderecosSalvosView } from "../../../src/modulos/perfil/view/EnderecosSalvosView";

export default function Enderecos() {
  const vm = useEnderecosSalvosViewModel();
  return <EnderecosSalvosView {...vm} />;
}
