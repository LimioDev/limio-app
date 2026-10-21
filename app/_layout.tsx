import { TextDecoder, TextEncoder } from "text-encoding";

import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import { useRestaurarSessaoViewModel } from "../src/modulos/auth/viewmodel/useRestaurarSessaoViewModel";
import { Toast } from "../src/comum/componentes/ui/Toast";
import { queryClient } from "../src/comum/lib/query";

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

export default function RootLayout() {
  // A splash fica na frente enquanto a sessão salva é lida.
  const status = useRestaurarSessaoViewModel();
  const autenticado = status === "autenticado";

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!autenticado}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={autenticado}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        {/* Fora dos guards: o link do e-mail pode ser aberto com alguém já logado no aparelho. */}
        <Stack.Screen name="nova-senha" />

      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
