import { useRouter } from "expo-router";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { AppState } from "react-native";

import { configurarNotificacoes } from "../../../comum/lib/push";
import { registrarEsteAparelho } from "../../../comum/servico/aparelhoPush";
import { useSessao } from "../../../comum/store/sessao";
import {
  escutarPush,
  escutarTrocaDeToken,
  type PushRecebido,
} from "../servico/notificacao.push";
import { useAtualizarNotificacoes } from "../servico/notificacao.queries";
import type { TipoNotificacao } from "../tipos/notificacao.enums";
import { useAbrirNotificacao } from "./useAbrirNotificacao";

/** Tempo que o banner fica na tela se ninguém tocar nele. */
const DURACAO_BANNER_MS = 5000;

export interface BannerPush {
  /** Muda a cada push: dois avisos seguidos reiniciam a animação e o prazo. */
  chave: string;
  tipo: TipoNotificacao | null;
  titulo: string;
  corpo: string;
}

/**
 * Push no aparelho (ETI-113, US56). Montado no layout de `(app)`, então roda
 * depois do login e ao abrir o app com sessão:
 * - registra o aparelho (pede a permissão se ainda não pediu); falhou, tenta
 *   de novo quando o app volta ao primeiro plano ou na próxima abertura;
 * - push com o app aberto vira banner dentro do app e atualiza lista e sino;
 * - tocar no push ou no banner abre a mesma tela que o item da tela 43.
 */
export function usePushNotificacoesViewModel() {
  const router = useRouter();
  const usuarioId = useSessao((estado) => estado.usuarioId);
  const atualizarNotificacoes = useAtualizarNotificacoes();
  const { abrir } = useAbrirNotificacao();
  const [banner, setBanner] = useState<(BannerPush & { push: PushRecebido }) | null>(
    null,
  );

  // --- Registro do aparelho ---
  const registrado = useRef(false);
  const registrando = useRef(false);

  const registrar = useCallback(async () => {
    // O pedido de permissão tira o app do primeiro plano e o devolve: sem a
    // trava, a volta dispararia um segundo registro no meio do primeiro.
    if (registrando.current) {
      return;
    }
    registrando.current = true;
    registrado.current = await registrarEsteAparelho();
    registrando.current = false;
  }, []);

  useEffect(() => {
    configurarNotificacoes();
    registrado.current = false;
    void registrar();

    const aoMudarEstado = AppState.addEventListener("change", (estado) => {
      // Também cobre quem liga a permissão pelos ajustes do aparelho (ETI-41).
      if (estado === "active" && !registrado.current) {
        void registrar();
      }
    });
    const pararTroca = escutarTrocaDeToken(() => void registrar());
    return () => {
      aoMudarEstado.remove();
      pararTroca();
    };
    // Outra conta entrou no aparelho: registra de novo, agora pra ela.
  }, [usuarioId, registrar]);

  // --- Push recebido e toque ---
  const abrirPush = (push: PushRecebido | null) => {
    if (!push) {
      // Push sem os dados do toque: a lista é o lugar mais próximo.
      router.push("/(app)/notificacoes");
      return;
    }
    const { notificacaoId, tipo, anuncioId } = push.dados;
    void abrir({ id: notificacaoId, tipo, anuncioId, naoLida: true }, () =>
      router.push("/(app)/notificacoes"),
    );
  };

  // Effect events: os ouvintes são assinados uma vez só e leem o papel ativo atual.
  const aoTocarPush = useEffectEvent(abrirPush);
  const aoReceberPush = useEffectEvent((push: PushRecebido) => {
    void atualizarNotificacoes();
    setBanner({
      chave: push.idAparelho,
      tipo: push.dados.tipo,
      titulo: push.titulo,
      corpo: push.corpo,
      push,
    });
  });

  useEffect(
    () =>
      escutarPush({
        aoReceber: (push) => aoReceberPush(push),
        aoTocar: (push) => aoTocarPush(push),
      }),
    [],
  );

  useEffect(() => {
    if (!banner) {
      return;
    }
    const temporizador = setTimeout(() => setBanner(null), DURACAO_BANNER_MS);
    return () => clearTimeout(temporizador);
  }, [banner]);

  const aoTocarBanner = () => {
    if (banner) {
      setBanner(null);
      abrirPush(banner.push);
    }
  };

  return {
    banner: banner
      ? { chave: banner.chave, tipo: banner.tipo, titulo: banner.titulo, corpo: banner.corpo }
      : null,
    aoTocarBanner,
    aoFecharBanner: () => setBanner(null),
  };
}
