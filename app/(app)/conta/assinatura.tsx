import { AssinarGoldView } from "../../../src/modulos/financeiro/view/AssinarGoldView";
import { useAssinarGoldViewModel } from "../../../src/modulos/financeiro/viewmodel/useAssinarGoldViewModel";

/** Tela 34 "Assinatura": assinar o plano GOLD (ETI-82). */
export default function Assinatura() {
  const vm = useAssinarGoldViewModel();
  return <AssinarGoldView {...vm} />;
}
