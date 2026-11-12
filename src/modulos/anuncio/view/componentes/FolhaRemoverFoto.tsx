import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import type { FolhaRemoverFotoExibida } from "../../viewmodel/useCheckoutViewModel";

interface FolhaRemoverFotoProps {
  folha: FolhaRemoverFotoExibida;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

/** Tela 38: confirma a remoção da foto tocada. Modal próprio porque `Alert` não abre no navegador. */
export function FolhaRemoverFoto({ folha, aoConfirmar, aoFechar }: FolhaRemoverFotoProps) {
  return (
    <Modal
      visible={folha.aberta}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          onPress={aoFechar}
          accessibilityLabel="Fechar"
          className="absolute inset-0 bg-marca-900/50"
        />
        <SafeAreaView edges={["bottom"]} className="rounded-t-sheet bg-superficie">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-borda-campo" />
          </View>
          <View className="gap-5 px-margem pb-4 pt-4">
            <View className="gap-1">
              <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                Remover foto?
              </Text>
              <Text className="text-rotulo text-tinta-suave">
                {folha.rotulo} sai do check-out. Você pode adicionar outra depois.
              </Text>
            </View>
            <View className="gap-2">
              <Botao rotulo="Remover foto" variante="destrutivo" onPress={aoConfirmar} />
              <Botao rotulo="Cancelar" variante="neutro" onPress={aoFechar} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
