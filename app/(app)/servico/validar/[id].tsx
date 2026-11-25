import { useLocalSearchParams } from "expo-router";

import { ValidarServicoView } from "../../../../src/modulos/anuncio/view/ValidarServicoView";
import { useValidarServicoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useValidarServicoViewModel";

/** Tela 27 "Validar serviço" do Empregador; o `id` é o do anúncio. */
export default function ValidarServico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useValidarServicoViewModel(id);
  return <ValidarServicoView {...vm} />;
}
