import { useAlterarSenhaViewModel } from "../../src/modulos/auth/viewmodel/useAlterarSenhaViewModel";
import { AlterarSenhaView } from "../../src/modulos/auth/view/AlterarSenhaView";

export default function AlterarSenha() {
  const vm = useAlterarSenhaViewModel();
  return <AlterarSenhaView {...vm} />;
}
