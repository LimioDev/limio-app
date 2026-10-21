import { useNovaSenhaViewModel } from "../src/modulos/auth/viewmodel/useNovaSenhaViewModel";
import { NovaSenhaView } from "../src/modulos/auth/view/NovaSenhaView";

// Aberta pelo link do e-mail: limio://nova-senha?token=...
export default function NovaSenha() {
  const vm = useNovaSenhaViewModel();
  return <NovaSenhaView {...vm} />;
}
