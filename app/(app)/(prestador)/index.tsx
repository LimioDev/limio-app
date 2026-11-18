import { useMuralViewModel } from "../../../src/modulos/anuncio/viewmodel/useMuralViewModel";
import { MuralView } from "../../../src/modulos/anuncio/view/MuralView";
import { useSinoNotificacoesViewModel } from "../../../src/modulos/notificacao/viewmodel/useSinoNotificacoesViewModel";
import { SinoNotificacoesView } from "../../../src/modulos/notificacao/view/SinoNotificacoesView";
import { useAtuacaoDoMuralViewModel } from "../../../src/modulos/perfil/viewmodel/useAtuacaoDoMuralViewModel";
import { useFaixaCotaViewModel } from "../../../src/modulos/perfil/viewmodel/useFaixaCotaViewModel";
import { FaixaCotaView } from "../../../src/modulos/perfil/view/FaixaCotaView";

export default function Mural() {
  // Especialidades, raio e cota vêm do perfil; a rota junta os dois módulos.
  const atuacao = useAtuacaoDoMuralViewModel();
  const vm = useMuralViewModel(atuacao);
  const { faixa, ...faixaAcoes } = useFaixaCotaViewModel();
  // Tela 43 vale pros dois papéis: o Prestador também tem o sino.
  const sino = useSinoNotificacoesViewModel();
  return (
    <MuralView
      {...vm}
      faixaCota={faixa ? <FaixaCotaView faixa={faixa} {...faixaAcoes} /> : null}
      sino={<SinoNotificacoesView {...sino} />}
    />
  );
}
