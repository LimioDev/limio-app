import { useNovoAnuncioViewModel } from "../../../../src/modulos/anuncio/viewmodel/useNovoAnuncioViewModel";
import { NovoAnuncioView } from "../../../../src/modulos/anuncio/view/NovoAnuncioView";

/** Tela 14 "Novo anúncio" (1 de 2). */
export default function NovoAnuncio() {
  const vm = useNovoAnuncioViewModel();
  return <NovoAnuncioView {...vm} />;
}
