import { AplicacoesView } from "../../../src/modulos/anuncio/view/AplicacoesView";
import { useAplicacoesViewModel } from "../../../src/modulos/anuncio/viewmodel/useAplicacoesViewModel";

/** Tela 32 "Aplicações" do Prestador (ETI-78). */
export default function Aplicacoes() {
  const vm = useAplicacoesViewModel();
  return <AplicacoesView {...vm} />;
}
