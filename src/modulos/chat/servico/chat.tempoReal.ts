import { Client } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import * as Codificacao from "text-encoding";

import {
  garantirTokenAcessoValido,
  obterTokenAcesso,
  URL_TEMPO_REAL,
} from "../../../comum/lib/api";
import { EventoChatSchema, type EventoChat } from "../tipos/chat.types";

/** Fila do usuário no canal (`ChatTempoRealService.FILA_CHAT`, com o prefixo `/user`). */
const FILA_CHAT = "/user/queue/chat";
const ESPERA_RECONEXAO_MS = 3000;
const BATIMENTO_MS = 10_000;

// O parser do STOMP usa TextEncoder/TextDecoder, que o Hermes pode não ter.
const global = globalThis as unknown as Record<string, unknown>;
global.TextEncoder ??= Codificacao.TextEncoder;
global.TextDecoder ??= Codificacao.TextDecoder;

interface OpcoesCanal {
  aoEvento: (evento: EventoChat) => void;
  /** A cada conexão (inclusive a primeira): o que chegou com o canal fora está só no histórico. */
  aoConectar: () => void;
}

/**
 * Conecta ao canal em tempo real (STOMP em `/ws`) e assina a fila do usuário.
 * O token vai no CONNECT e é renovado antes de cada tentativa: a API derruba a
 * sessão quando o token do CONNECT vence, e o cliente reconecta sozinho.
 * Devolve a função que desconecta.
 */
function conectarCanalChat({ aoEvento, aoConectar }: OpcoesCanal): () => void {
  const cliente = new Client({
    brokerURL: URL_TEMPO_REAL,
    reconnectDelay: ESPERA_RECONEXAO_MS,
    heartbeatIncoming: BATIMENTO_MS,
    heartbeatOutgoing: BATIMENTO_MS,
    // Ajustes do STOMP no WebSocket do React Native.
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    beforeConnect: async (c) => {
      // Falha de rede na renovação não impede a tentativa com o token atual.
      await garantirTokenAcessoValido().catch(() => {});
      const token = await obterTokenAcesso();
      if (!token) {
        // Sessão encerrada: não adianta insistir.
        await c.deactivate();
        return;
      }
      c.connectHeaders = { Authorization: `Bearer ${token}` };
    },
    onConnect: () => {
      cliente.subscribe(FILA_CHAT, (frame) => {
        try {
          const resultado = EventoChatSchema.safeParse(JSON.parse(frame.body));
          if (resultado.success) {
            aoEvento(resultado.data);
          }
        } catch {
          // Frame fora do formato: ignora, o histórico é a fonte da verdade.
        }
      });
      aoConectar();
    },
  });
  cliente.activate();
  return () => {
    void cliente.deactivate();
  };
}

/**
 * Mantém o canal ligado enquanto `ativo` (tela aberta e app em primeiro
 * plano) e desliga ao sair. Os callbacks podem mudar a cada render sem
 * reconectar.
 */
export function useCanalChat(ativo: boolean, opcoes: OpcoesCanal): void {
  const opcoesRef = useRef(opcoes);
  useEffect(() => {
    opcoesRef.current = opcoes;
  });

  useEffect(() => {
    if (!ativo) {
      return;
    }
    return conectarCanalChat({
      aoEvento: (evento) => opcoesRef.current.aoEvento(evento),
      aoConectar: () => opcoesRef.current.aoConectar(),
    });
  }, [ativo]);
}
