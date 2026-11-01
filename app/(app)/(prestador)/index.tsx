import { useMuralViewModel } from "../../../src/modulos/anuncio/viewmodel/useMuralViewModel";
import { MuralView } from "../../../src/modulos/anuncio/view/MuralView";
import { useAtuacaoDoMuralViewModel } from "../../../src/modulos/perfil/viewmodel/useAtuacaoDoMuralViewModel";

export default function Mural() {
  // Especialidades e raio vêm do perfil; a rota junta os dois módulos.
  const atuacao = useAtuacaoDoMuralViewModel();
  const vm = useMuralViewModel(atuacao);
  return <MuralView {...vm} />;
}
