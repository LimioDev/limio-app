import { useLocalSearchParams } from "expo-router";

import { useEnderecoViewModel } from "../../../src/modulos/perfil/viewmodel/useEnderecoViewModel";
import { EnderecoView } from "../../../src/modulos/perfil/view/EnderecoView";

/** Sem `id`: novo endereço. Com `id`: edição. */
export default function Endereco() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vm = useEnderecoViewModel(id);
  return <EnderecoView {...vm} />;
}
