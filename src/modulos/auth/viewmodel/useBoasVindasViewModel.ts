import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useSessao } from "../../../comum/store/sessao";

export function useBoasVindasViewModel() {
  const router = useRouter();
  const avisoSaida = useSessao((estado) => estado.avisoSaida);

  // Sessão derrubada sem o usuário pedir (ex.: encerrada em outro aparelho):
  // o guard traz pra cá, mas o fluxo esperado é a tela de login com o aviso.
  useEffect(() => {
    if (avisoSaida) {
      router.push("/(auth)/login");
    }
  }, [avisoSaida, router]);

  return {
    aoCriarConta: () => router.push("/(auth)/cadastro"),
    aoEntrar: () => router.push("/(auth)/login"),
  };
}
