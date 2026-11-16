import { Bell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";

interface SinoNotificacoesViewProps {
  naoLidas: number;
  aoAbrirNotificacoes: () => void;
}

/** Sino da tela 13 com o total de não lidas no canto (some quando é zero). */
export function SinoNotificacoesView({ naoLidas, aoAbrirNotificacoes }: SinoNotificacoesViewProps) {
  const rotulo =
    naoLidas === 0
      ? "Notificações"
      : `Notificações, ${naoLidas} ${naoLidas === 1 ? "não lida" : "não lidas"}`;

  return (
    <Pressable
      onPress={aoAbrirNotificacoes}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      className="h-toque w-toque items-center justify-center rounded-campo border border-borda bg-superficie active:opacity-70"
    >
      <Icone icone={Bell} tamanho={20} cor="tinta" />
      {naoLidas > 0 ? (
        <View className="absolute -right-1.5 -top-1.5 h-5 min-w-5 items-center justify-center rounded-full border-2 border-fundo bg-marca-500 px-1">
          <Text className="text-[10px] font-bold leading-3 text-white">
            {naoLidas > 99 ? "99+" : naoLidas}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
