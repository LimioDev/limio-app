import { Stack } from "expo-router";

/** Criar e acompanhar anúncio (telas 14 a 16): pilha própria, sem a barra de abas. */
export default function AnuncioLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
