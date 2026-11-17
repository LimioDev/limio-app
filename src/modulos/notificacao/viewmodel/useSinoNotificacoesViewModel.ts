import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";

import { useConsultarNaoLidasDeNovo, useNaoLidasQuery } from "../servico/notificacao.queries";

/**
 * Sino do topo da tela 13 "Início" com o total de não lidas (ETI-111). Fica no
 * módulo `notificacao` e a rota passa pronto pro painel, pra `anuncio` não
 * importar este módulo.
 */
export function useSinoNotificacoesViewModel() {
  const router = useRouter();
  const query = useNaoLidasQuery();
  const consultarDeNovo = useConsultarNaoLidasDeNovo();

  // O dashboard continua montado nas abas: ao voltar pra ele, confere se
  // chegou notificação nova. O primeiro foco é pulado porque o mount já consultou.
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      void consultarDeNovo();
    }, [consultarDeNovo]),
  );

  return {
    // Falha na consulta só esconde o número: o sino continua abrindo a tela 43.
    naoLidas: query.data ?? 0,
    aoAbrirNotificacoes: () => router.push("/(app)/notificacoes"),
  };
}
