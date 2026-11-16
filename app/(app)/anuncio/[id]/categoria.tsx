import {
  FluxoCategoria,
  useCategoriaAnuncioViewModel,
} from "../../../../src/modulos/anuncio/viewmodel/useCategoriaAnuncioViewModel";
import { CategoriaAnuncioView } from "../../../../src/modulos/anuncio/view/CategoriaAnuncioView";

/** Tela 14a "Categoria" aberta pelo "Trocar" da tela 16a. */
export default function CategoriaEdicaoAnuncio() {
  const vm = useCategoriaAnuncioViewModel(FluxoCategoria.EDICAO);
  return <CategoriaAnuncioView {...vm} />;
}
