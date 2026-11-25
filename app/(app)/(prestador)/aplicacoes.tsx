import { useLocalSearchParams } from "expo-router";

import { AplicacoesView } from "../../../src/modulos/anuncio/view/AplicacoesView";
import { useAplicacoesViewModel } from "../../../src/modulos/anuncio/viewmodel/useAplicacoesViewModel";

/** Tela 32 "Aplicações" do Prestador (ETI-78); `aba` abre direto numa aba (ex.: HISTORICO). */
export default function Aplicacoes() {
  const { aba } = useLocalSearchParams<{ aba?: string }>();
  const vm = useAplicacoesViewModel(aba);
  return <AplicacoesView {...vm} />;
}
