import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useSessao } from "../../../comum/store/sessao";

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Lê a sessão salva no aparelho antes da primeira tela, segurando a splash
 * até lá — sem isso o app piscaria a Boas-vindas pra quem já está logado.
 */
export function useRestaurarSessaoViewModel() {
  const status = useSessao((estado) => estado.status);
  const restaurar = useSessao((estado) => estado.restaurar);

  useEffect(() => {
    restaurar().catch(() => useSessao.setState({ status: "anonimo" }));
  }, [restaurar]);

  useEffect(() => {
    if (status !== "carregando") {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  return status;
}
