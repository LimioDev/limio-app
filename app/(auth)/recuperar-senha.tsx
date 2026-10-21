import { useRecuperarSenhaViewModel } from "../../src/modulos/auth/viewmodel/useRecuperarSenhaViewModel";
import { RecuperarSenhaView } from "../../src/modulos/auth/view/RecuperarSenhaView";

export default function RecuperarSenha() {
  const vm = useRecuperarSenhaViewModel();
  return <RecuperarSenhaView {...vm} />;
}
