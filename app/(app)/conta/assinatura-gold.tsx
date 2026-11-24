import { AssinaturaGoldView } from "../../../src/modulos/financeiro/view/AssinaturaGoldView";
import { useAssinaturaGoldViewModel } from "../../../src/modulos/financeiro/viewmodel/useAssinaturaGoldViewModel";

/** Tela 35 "Assinatura GOLD" (ETI-84). */
export default function AssinaturaGold() {
  const vm = useAssinaturaGoldViewModel();
  return <AssinaturaGoldView {...vm} />;
}
