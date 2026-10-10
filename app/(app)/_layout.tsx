import { Stack } from "expo-router";

import { useSessao } from "../../src/comum/store/sessao";
import { PapelUsuario } from "../../src/comum/tipos/papel";

export default function AppLayout() {
  const prestador = useSessao(
    (estado) => estado.papelAtivo === PapelUsuario.PRESTADOR,
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Só o dashboard do papel ativo fica acessível; trocar o papel redireciona. */}
      <Stack.Protected guard={!prestador}>
        <Stack.Screen name="(contratante)" />
      </Stack.Protected>
      <Stack.Protected guard={prestador}>
        <Stack.Screen name="(prestador)" />
      </Stack.Protected>
      <Stack.Screen name="trocar-papel" options={{ presentation: "modal" }} />
    </Stack>
  );
}
