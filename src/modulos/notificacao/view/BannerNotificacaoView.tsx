import { X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icone } from "../../../comum/componentes/ui/Icone";
import type { BannerPush } from "../viewmodel/usePushNotificacoesViewModel";
import { iconeNotificacao } from "./componentes/iconeNotificacao";

interface BannerNotificacaoViewProps {
  banner: BannerPush | null;
  aoTocarBanner: () => void;
  aoFecharBanner: () => void;
}

/**
 * Push que chega com o app aberto (ETI-113): banner no topo, por cima de
 * qualquer tela de `(app)`. Tocar abre a tela do aviso; o X só fecha.
 */
export function BannerNotificacaoView({
  banner,
  aoTocarBanner,
  aoFecharBanner,
}: BannerNotificacaoViewProps) {
  const { top } = useSafeAreaInsets();

  if (!banner) {
    return null;
  }

  return (
    <Animated.View
      key={banner.chave}
      entering={FadeInUp}
      exiting={FadeOutUp}
      className="absolute inset-x-0 px-margem"
      // Em `style`, não como prop: a prop está descontinuada no react-native-web.
      style={{ top: top + 8, pointerEvents: "box-none" }}
    >
      <View className="flex-row items-start gap-3 rounded-card border border-borda bg-superficie p-4 shadow-lg">
        <Pressable
          onPress={aoTocarBanner}
          accessibilityRole="button"
          accessibilityLabel={`Nova notificação: ${banner.titulo}. ${banner.corpo}`}
          accessibilityHint="Abre a notificação"
          className="flex-1 flex-row gap-3 active:opacity-70"
        >
          <View className="h-10 w-10 items-center justify-center rounded-campo bg-marca-50">
            <Icone icone={iconeNotificacao(banner.tipo)} tamanho={18} cor="marca-escura" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-corpo font-bold text-tinta" numberOfLines={1}>
              {banner.titulo}
            </Text>
            <Text className="text-rotulo text-tinta-suave" numberOfLines={2}>
              {banner.corpo}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={aoFecharBanner}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          hitSlop={12}
          className="active:opacity-70"
        >
          <Icone icone={X} tamanho={18} cor="fraco" />
        </Pressable>
      </View>
    </Animated.View>
  );
}
