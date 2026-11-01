import { useLocalSearchParams } from "expo-router";

import { useAnuncioPublicadoViewModel } from "../../../src/modulos/anuncio/viewmodel/useAnuncioPublicadoViewModel";
import { AnuncioPublicadoView } from "../../../src/modulos/anuncio/view/AnuncioPublicadoView";

/** Tela 16 "Anúncio publicado" — detalhe do anúncio do Empregador. */
export default function AnuncioPublicado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useAnuncioPublicadoViewModel(id);
  return <AnuncioPublicadoView {...vm} />;
}
