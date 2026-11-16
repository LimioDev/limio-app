import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { PlataformaPush } from "../tipos/aparelhoPush";

/** Push só existe no aparelho (Android/iOS); no web tudo aqui vira no-op. */
export const PUSH_SUPORTADO = Platform.OS === "android" || Platform.OS === "ios";

export const PLATAFORMA_PUSH =
  Platform.OS === "ios" ? PlataformaPush.IOS : PlataformaPush.ANDROID;

/** Canal padrão: é nele que o Expo Push Service entrega quando o back não diz outro. */
const CANAL_ANDROID = "default";

let configurado = false;
/** Último token obtido nesta execução do app; o logout remove este. */
let tokenAtual: string | null = null;

/**
 * Comportamento com o app aberto: o aviso não vira banner do sistema (o app
 * mostra o próprio banner), mas fica na central de notificações.
 */
export function configurarNotificacoes(): void {
  if (!PUSH_SUPORTADO || configurado) {
    return;
  }
  configurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * `true` se pode receber push. Pede ao sistema só se ainda não pediu: negada
 * uma vez, não insiste (o atalho pros ajustes do aparelho fica em Ajustes, ETI-41).
 */
export async function garantirPermissaoPush(): Promise<boolean> {
  if (!PUSH_SUPORTADO) {
    return false;
  }
  // Android 13+: sem canal criado, o pedido de permissão não aparece.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: "Avisos",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (permitida(atual)) {
    return true;
  }
  if (atual.status !== Notifications.PermissionStatus.UNDETERMINED) {
    return false;
  }
  return permitida(await Notifications.requestPermissionsAsync());
}

function permitida(permissao: Notifications.NotificationPermissionsStatus): boolean {
  if (permissao.granted) {
    return true;
  }
  // iOS: a permissão provisória entrega na central, sem banner — também serve.
  return permissao.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/**
 * Token do Expo Push Service deste aparelho. Lança sem rede, em simulador ou
 * sem `extra.eas.projectId` no app.json — quem chama trata como "tenta depois".
 */
export async function obterTokenPush(): Promise<string> {
  const projectId =
    Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  tokenAtual = data;
  return data;
}

/**
 * Token a remover no logout: o desta execução ou, se ainda não foi obtido
 * (ex.: o registro falhou ao abrir), busca agora. `null` = nada a remover.
 */
export async function tokenPushParaRemover(): Promise<string | null> {
  if (!PUSH_SUPORTADO) {
    return null;
  }
  if (tokenAtual) {
    return tokenAtual;
  }
  const { granted } = await Notifications.getPermissionsAsync();
  return granted ? obterTokenPush() : null;
}

/** Depois do logout o token não é mais desta conta. */
export function esquecerTokenPush(): void {
  tokenAtual = null;
}
