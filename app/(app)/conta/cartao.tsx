import { CartaoGoldView } from "../../../src/modulos/financeiro/view/CartaoGoldView";
import { useCartaoGoldViewModel } from "../../../src/modulos/financeiro/viewmodel/useCartaoGoldViewModel";

/** Cadastrar ou trocar o cartão da assinatura GOLD (ETI-84). */
export default function CartaoGold() {
  const vm = useCartaoGoldViewModel();
  return <CartaoGoldView {...vm} />;
}
