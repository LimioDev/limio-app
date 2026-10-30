import { useCategoriaAnuncioViewModel } from "../../../../src/modulos/anuncio/viewmodel/useCategoriaAnuncioViewModel";
import { CategoriaAnuncioView } from "../../../../src/modulos/anuncio/view/CategoriaAnuncioView";

/** Tela 14a "Categoria". */
export default function CategoriaAnuncio() {
  const vm = useCategoriaAnuncioViewModel();
  return <CategoriaAnuncioView {...vm} />;
}
