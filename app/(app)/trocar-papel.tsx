import { useTrocarPapelViewModel } from "../../src/modulos/auth/viewmodel/useTrocarPapelViewModel";
import { TrocarPapelView } from "../../src/modulos/auth/view/TrocarPapelView";
import { useCompletarAtuacaoViewModel } from "../../src/modulos/perfil/viewmodel/useCompletarAtuacaoViewModel";

export default function TrocarPapel() {
  const vm = useTrocarPapelViewModel();
  // O perfil de atuação é do módulo `perfil`; a rota junta os dois.
  const atuacao = useCompletarAtuacaoViewModel();
  return <TrocarPapelView {...vm} {...atuacao} />;
}
