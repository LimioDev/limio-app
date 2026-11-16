import * as Notifications from "expo-notifications";

import { PUSH_SUPORTADO } from "../../../comum/lib/push";
import { DadosPushSchema, type DadosPush } from "../tipos/notificacao.types";

/** Push recebido, já validado: o texto mostrado e os dados do toque. */
export interface PushRecebido {
  /** Id do push no aparelho (não o da notificação): evita tratar o mesmo toque duas vezes. */
  idAparelho: string;
  titulo: string;
  corpo: string;
  dados: DadosPush;
}

/** `null` = push que não veio do serviço de notificações (sem os dados do toque). */
export function lerPush(notificacao: Notifications.Notification): PushRecebido | null {
  const { identifier, content } = notificacao.request;
  const dados = DadosPushSchema.safeParse(content.data);
  if (!dados.success) {
    return null;
  }
  return {
    idAparelho: identifier,
    titulo: content.title ?? "",
    corpo: content.body ?? "",
    dados: dados.data,
  };
}

/**
 * Último toque tratado. No arranque o mesmo toque pode chegar pela "última
 * resposta" e pelo ouvinte; fora do hook pra valer também entre logins.
 */
let ultimoToque: string | null = null;

/**
 * Escuta o push que chega com o app aberto e o toque no push (inclusive o que
 * abriu o app do zero). Devolve a função que para de escutar. No web, nada.
 */
export function escutarPush(ouvintes: {
  aoReceber: (push: PushRecebido) => void;
  aoTocar: (push: PushRecebido | null) => void;
}): () => void {
  if (!PUSH_SUPORTADO) {
    return () => {};
  }
  let ativo = true;
  const tocar = (resposta: Notifications.NotificationResponse) => {
    // Só o toque no aviso; ações extras do sistema não abrem tela.
    if (resposta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }
    const id = resposta.notification.request.identifier;
    if (id === ultimoToque) {
      return;
    }
    ultimoToque = id;
    // Já tratado: não abre de novo na próxima vez que o app subir.
    void Notifications.clearLastNotificationResponseAsync().catch(() => {});
    ouvintes.aoTocar(lerPush(resposta.notification));
  };

  // O toque que abriu o app (fechado ou antes do login) chega como "última resposta".
  Notifications.getLastNotificationResponseAsync()
    .then((resposta) => {
      if (ativo && resposta) {
        tocar(resposta);
      }
    })
    .catch(() => {});

  const recebido = Notifications.addNotificationReceivedListener((notificacao) => {
    const push = lerPush(notificacao);
    if (push) {
      ouvintes.aoReceber(push);
    }
  });
  const tocado = Notifications.addNotificationResponseReceivedListener(tocar);
  return () => {
    ativo = false;
    recebido.remove();
    tocado.remove();
  };
}

/** Token do aparelho trocado pelo sistema: o antigo deixa de valer. */
export function escutarTrocaDeToken(aoTrocar: () => void): () => void {
  if (!PUSH_SUPORTADO) {
    return () => {};
  }
  const assinatura = Notifications.addPushTokenListener(aoTrocar);
  return () => assinatura.remove();
}
