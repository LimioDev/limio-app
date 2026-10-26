import { useDetalhesAnuncioViewModel } from "../../../../src/modulos/anuncio/viewmodel/useDetalhesAnuncioViewModel";
import { DetalhesAnuncioView } from "../../../../src/modulos/anuncio/view/DetalhesAnuncioView";

/** Tela 15 "Novo anúncio" (2 de 2). */
export default function DetalhesAnuncio() {
  const vm = useDetalhesAnuncioViewModel();
  return <DetalhesAnuncioView {...vm} />;
}
