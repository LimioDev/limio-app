import { useLocalSearchParams } from "expo-router";

import { ProporReagendamentoView } from "../../../../src/modulos/anuncio/view/ProporReagendamentoView";
import { useProporReagendamentoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useProporReagendamentoViewModel";

/** Tela 40 "Propor reagendamento", pelas duas partes; o `id` é o do anúncio. */
export default function ProporReagendamento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useProporReagendamentoViewModel(id);
  return <ProporReagendamentoView {...vm} />;
}
