import { useLoginViewModel } from "../../src/modulos/auth/viewmodel/useLoginViewModel";
import { LoginView } from "../../src/modulos/auth/view/LoginView";

export default function Login() {
  const vm = useLoginViewModel();
  return <LoginView {...vm} />;
}
