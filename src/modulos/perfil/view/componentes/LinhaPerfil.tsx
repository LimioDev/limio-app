import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface LinhaPerfilProps {
  rotulo: string;
  valor: string;
  onPress: () => void;
  icone?: LucideIcon;
  /** Divisória acima — toda linha menos a primeira do cartão. */
  comDivisoria?: boolean;
}

/** Linha tocável dos cartões de "Meu perfil": rótulo pequeno em cima, valor embaixo, seta à direita. */
export function LinhaPerfil({
  rotulo,
  valor,
  onPress,
  icone,
  comDivisoria = false,
}: LinhaPerfilProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rotulo}: ${valor}`}
      className="flex-row items-center gap-3 px-4 active:opacity-70"
    >
      {icone ? (
        <View className="h-9 w-9 items-center justify-center rounded-chip bg-marca-50">
          <Icone icone={icone} tamanho={18} cor="marca" />
        </View>
      ) : null}
      <View
        className={`flex-1 flex-row items-center gap-3 py-3.5 ${comDivisoria ? "border-t border-borda" : ""}`}
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-rotulo text-tinta-fraco">{rotulo}</Text>
          <Text className="text-corpo text-tinta" numberOfLines={1}>
            {valor}
          </Text>
        </View>
        <Icone icone={ChevronRight} tamanho={20} cor="suave" />
      </View>
    </Pressable>
  );
}
