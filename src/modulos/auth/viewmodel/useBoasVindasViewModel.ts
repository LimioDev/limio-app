import { useRouter } from "expo-router";

export function useBoasVindasViewModel() {
  const router = useRouter();

  return {
    aoCriarConta: () => router.push("/(auth)/cadastro"),
    aoEntrar: () => router.push("/(auth)/login"),
  };
}
