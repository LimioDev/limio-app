import { useLocalSearchParams } from "expo-router";

import { AssinaturaGoldView } from "../../../src/modulos/financeiro/view/AssinaturaGoldView";
import { useAssinaturaGoldViewModel } from "../../../src/modulos/financeiro/viewmodel/useAssinaturaGoldViewModel";

/**
 * Tela 35 "Assinatura GOLD" (versão mínima do ETI-82; o ETI-84 completa).
 * `renovaEm` vem da resposta do "Assinar GOLD", quando há.
 */
export default function AssinaturaGold() {
  const { renovaEm } = useLocalSearchParams<{ renovaEm?: string }>();
  const vm = useAssinaturaGoldViewModel(renovaEm);
  return <AssinaturaGoldView {...vm} />;
}
