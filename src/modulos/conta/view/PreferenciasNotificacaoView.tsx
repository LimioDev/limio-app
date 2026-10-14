import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { BellOff } from "lucide-react-native";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Interruptor } from "../../../comum/componentes/ui/Interruptor";
import {
  CANAIS_NOTIFICACAO,
  CanalNotificacao,
  rotuloCanal,
} from "../tipos/conta.enums";
import type { PreferenciasNotificacao } from "../tipos/conta.types";

// Texto provisório: o Figma ainda não tem o toggle de WhatsApp (pendência de design do ETI-41).
const TEXTO_CONSENTIMENTO_WHATSAPP =
  "Ao ligar, você autoriza o Limio a enviar avisos pelo WhatsApp. Você pode desligar quando quiser.";

interface PreferenciasNotificacaoViewProps {
  preferencias: PreferenciasNotificacao | null;
  carregando: boolean;
  erroCarregar: string | null;
  aoTentarDeNovo: () => void;
  salvando: boolean;
  erroSalvar: string | null;
  aoAlternarCanal: (canal: CanalNotificacao, ligado: boolean) => void;
  permissaoNegada: boolean;
  aoAbrirAjustesAparelho: () => void;
}

/** Seção "Notificações" da tela 11 Ajustes. */
export function PreferenciasNotificacaoView({
  preferencias,
  carregando,
  erroCarregar,
  aoTentarDeNovo,
  salvando,
  erroSalvar,
  aoAlternarCanal,
  permissaoNegada,
  aoAbrirAjustesAparelho,
}: PreferenciasNotificacaoViewProps) {
  return (
    <View className="gap-3">
      <Text className="text-overline font-bold uppercase text-tinta-fraco">
        Notificações
      </Text>

      {/* Visual provisório: o aviso de permissão negada ainda não foi desenhado (pendência do ETI-41). */}
      {permissaoNegada ? (
        <View className="flex-row items-start gap-3 rounded-card bg-alerta-fundo p-4">
          <Icone icone={BellOff} cor="suave" />
          <View className="flex-1 gap-2">
            <Text className="text-rotulo text-alerta">
              As notificações estão desativadas neste aparelho. Ative nos
              ajustes do aparelho para receber avisos por push.
            </Text>
            <Pressable
              onPress={aoAbrirAjustesAparelho}
              hitSlop={8}
              accessibilityRole="link"
            >
              <Text className="text-rotulo font-semibold text-alerta underline">
                Abrir ajustes do aparelho
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {carregando ? (
        <View className="items-center rounded-card border border-borda bg-superficie p-6">
          <ActivityIndicator color="#2159CC" />
        </View>
      ) : erroCarregar || !preferencias ? (
        <View className="gap-3 rounded-card border border-borda bg-superficie p-4">
          <Text className="text-rotulo text-perigo">
            {erroCarregar ?? "Não foi possível carregar suas notificações."}
          </Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            onPress={aoTentarDeNovo}
          />
        </View>
      ) : (
        <View className="rounded-card border border-borda bg-superficie">
          {CANAIS_NOTIFICACAO.map((canal, indice) => (
            <View
              key={canal}
              className={`flex-row items-center justify-between gap-4 px-4 py-3 ${indice > 0 ? "border-t border-borda" : ""}`}
            >
              <View className="flex-1 gap-1">
                <Text className="text-corpo font-semibold text-tinta">
                  {rotuloCanal(canal)}
                </Text>
                {canal === CanalNotificacao.WHATSAPP ? (
                  <Text className="text-rotulo text-tinta-suave">
                    {TEXTO_CONSENTIMENTO_WHATSAPP}
                  </Text>
                ) : null}
              </View>
              <Interruptor
                ligado={preferencias[canal]}
                aoAlternar={(ligado) => aoAlternarCanal(canal, ligado)}
                desabilitado={salvando}
                rotuloAcessivel={`Notificações por ${rotuloCanal(canal)}`}
              />
            </View>
          ))}
        </View>
      )}

      {erroSalvar ? (
        <Text className="text-rotulo text-perigo" accessibilityLiveRegion="polite">
          {erroSalvar}
        </Text>
      ) : null}
    </View>
  );
}
