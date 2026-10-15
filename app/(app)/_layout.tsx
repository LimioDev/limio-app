import { Stack } from "expo-router";

import { useSessao } from "../../src/comum/store/sessao";
import { PapelUsuario } from "../../src/comum/tipos/papel";

export default function AppLayout() {
  const papelAtivo = useSessao((estado) => estado.papelAtivo);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Só o dashboard do papel ativo fica acessível; trocar o papel redireciona.
          Sessão autenticada sempre tem papel do app (`ADMIN` não abre sessão),
          então nenhum papel cai num dashboard por exclusão. */}
      <Stack.Protected guard={papelAtivo === PapelUsuario.EMPREGADOR}>
        <Stack.Screen name="(contratante)" />
      </Stack.Protected>
      <Stack.Protected guard={papelAtivo === PapelUsuario.PRESTADOR}>
        <Stack.Screen name="(prestador)" />
      </Stack.Protected>
      <Stack.Screen name="trocar-papel" options={{ presentation: "modal" }} />
    </Stack>
  );
}
