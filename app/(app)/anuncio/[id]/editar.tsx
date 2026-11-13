import { useLocalSearchParams } from "expo-router";

import { useEditarAnuncioViewModel } from "../../../../src/modulos/anuncio/viewmodel/useEditarAnuncioViewModel";
import { EditarAnuncioView } from "../../../../src/modulos/anuncio/view/EditarAnuncioView";

/** Tela 16a "Editar anúncio" — botão "Editar" da tela 16. */
export default function EditarAnuncio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useEditarAnuncioViewModel(id);
  return <EditarAnuncioView {...vm} />;
}
