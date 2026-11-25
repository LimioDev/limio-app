import { useLocalSearchParams } from "expo-router";

import { RespostaReagendamentoView } from "../../../../src/modulos/anuncio/view/RespostaReagendamentoView";
import { useRespostaReagendamentoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useRespostaReagendamentoViewModel";

/**
 * Tela 41 "Proposta recebida", pelas duas partes; o `id` é o do anúncio (a
 * proposta aberta vem do serviço).
 */
export default function RespostaReagendamento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useRespostaReagendamentoViewModel(id);
  return <RespostaReagendamentoView {...vm} />;
}
