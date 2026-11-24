import { HistoricoView } from "../../../src/modulos/anuncio/view/HistoricoView";
import { useHistoricoViewModel } from "../../../src/modulos/anuncio/viewmodel/useHistoricoViewModel";

/** Tela 44 "Histórico" do Empregador (ETI-72), aberta pelo "Ver histórico" da tela 13. */
export default function Anuncios() {
  const vm = useHistoricoViewModel();
  return <HistoricoView {...vm} />;
}
