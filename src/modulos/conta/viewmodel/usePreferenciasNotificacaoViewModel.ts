import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { mensagemErroApi } from "../../../comum/lib/erros";
import {
  useAtualizarPreferenciasNotificacaoMutation,
  usePreferenciasNotificacaoQuery,
} from "../servico/conta.queries";
import type { CanalNotificacao } from "../tipos/conta.enums";

/**
 * `true` quando o usuário negou notificações no sistema. Confere ao abrir e
 * sempre que o app volta ao primeiro plano (ex.: voltando dos ajustes do aparelho).
 */
function usePermissaoNotificacaoNegada(): boolean {
  const [negada, setNegada] = useState(false);

  useEffect(() => {
    const conferir = () => {
      Notifications.getPermissionsAsync()
        .then(({ status }) =>
          setNegada(status === Notifications.PermissionStatus.DENIED),
        )
        // Plataforma sem suporte (ex.: web): sem aviso.
        .catch(() => setNegada(false));
    };

    conferir();
    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        conferir();
      }
    });
    return () => assinatura.remove();
  }, []);

  return negada;
}

export function usePreferenciasNotificacaoViewModel() {
  const query = usePreferenciasNotificacaoQuery();
  const mutation = useAtualizarPreferenciasNotificacaoMutation();
  const permissaoNegada = usePermissaoNotificacaoNegada();
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const preferencias = query.data ?? null;

  const aoAlternarCanal = (canal: CanalNotificacao, ligado: boolean) => {
    // Um salvamento por vez: o retorno ao estado anterior em caso de erro parte do último estado salvo.
    if (!preferencias || mutation.isPending) {
      return;
    }
    setErroSalvar(null);
    mutation.mutate(
      { ...preferencias, [canal]: ligado },
      {
        onError: (erro) =>
          setErroSalvar(
            mensagemErroApi(erro, "Não foi possível salvar. Tente de novo."),
          ),
      },
    );
  };

  return {
    preferencias,
    carregando: query.isPending,
    erroCarregar: query.isError
      ? mensagemErroApi(
          query.error,
          "Não foi possível carregar suas notificações.",
        )
      : null,
    aoTentarDeNovo: () => void query.refetch(),
    salvando: mutation.isPending,
    erroSalvar,
    aoAlternarCanal,
    permissaoNegada,
    aoAbrirAjustesAparelho: () => void Linking.openSettings(),
  };
}
