import { useLocalSearchParams } from "expo-router";

import { CheckoutView } from "../../../../src/modulos/anuncio/view/CheckoutView";
import { useCheckoutViewModel } from "../../../../src/modulos/anuncio/viewmodel/useCheckoutViewModel";

/** Tela 38 "Checkout"; o `id` é o do anúncio, como em "Seu serviço". */
export default function Checkout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useCheckoutViewModel(id);
  return <CheckoutView {...vm} />;
}
