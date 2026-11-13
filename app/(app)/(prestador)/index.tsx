import { useMuralViewModel } from "../../../src/modulos/anuncio/viewmodel/useMuralViewModel";
import { MuralView } from "../../../src/modulos/anuncio/view/MuralView";
import { useAtuacaoDoMuralViewModel } from "../../../src/modulos/perfil/viewmodel/useAtuacaoDoMuralViewModel";
import { useFaixaCotaViewModel } from "../../../src/modulos/perfil/viewmodel/useFaixaCotaViewModel";
import { FaixaCotaView } from "../../../src/modulos/perfil/view/FaixaCotaView";

export default function Mural() {
  // Especialidades, raio e cota vêm do perfil; a rota junta os dois módulos.
  const atuacao = useAtuacaoDoMuralViewModel();
  const vm = useMuralViewModel(atuacao);
  const { faixa, aoAbrirCota } = useFaixaCotaViewModel();
  return (
    <MuralView
      {...vm}
      faixaCota={faixa ? <FaixaCotaView faixa={faixa} aoAbrirCota={aoAbrirCota} /> : null}
    />
  );
}
