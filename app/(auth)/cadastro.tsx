import { useCadastroDadosViewModel } from "../../src/modulos/auth/viewmodel/useCadastroDadosViewModel";
import { CadastroDadosView } from "../../src/modulos/auth/view/CadastroDadosView";

export default function Cadastro() {
  const vm = useCadastroDadosViewModel();
  return <CadastroDadosView {...vm} />;
}
