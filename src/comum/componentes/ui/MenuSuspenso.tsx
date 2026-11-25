import type { LucideIcon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icone } from "./Icone";

export interface ItemMenuSuspenso {
  icone: LucideIcon;
  rotulo: string;
  aoPressionar: () => void;
}

interface MenuSuspensoProps {
  aberto: boolean;
  aoFechar: () => void;
  itens: ItemMenuSuspenso[];
}

/** Menu do "⋮" no topo (telas 21b e 25f), ancorado no canto superior direito. */
export function MenuSuspenso({ aberto, aoFechar, itens }: MenuSuspensoProps) {
  const { top } = useSafeAreaInsets();

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={aoFechar}>
      <Pressable
        className="flex-1 bg-marca-900/20"
        onPress={aoFechar}
        accessibilityLabel="Fechar menu"
      >
        <View
          style={{ top: top + 56 }}
          className="absolute right-margem w-[190px] rounded-campo bg-superficie py-1 shadow-lg"
        >
          {itens.map((item) => (
            <Pressable
              key={item.rotulo}
              onPress={item.aoPressionar}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-4 py-3 active:bg-fundo"
            >
              <Icone icone={item.icone} tamanho={20} cor="tinta" />
              <Text className="text-corpo font-semibold text-tinta">{item.rotulo}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
