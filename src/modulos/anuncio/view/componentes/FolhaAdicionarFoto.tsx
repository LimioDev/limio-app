import type { LucideIcon } from "lucide-react-native";
import { Camera, Image as IconeGaleria } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface FolhaAdicionarFotoProps {
  visivel: boolean;
  aoTirarFoto: () => void;
  aoEscolherDaGaleria: () => void;
  aoFechar: () => void;
}

function Opcao({
  icone,
  titulo,
  descricao,
  onPress,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      className="flex-row items-center gap-3 rounded-campo border border-borda bg-superficie p-3.5 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-chip bg-marca-50">
        <Icone icone={icone} tamanho={20} cor="marca" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-corpo font-bold text-tinta">{titulo}</Text>
        <Text className="text-rotulo text-tinta-fraco">{descricao}</Text>
      </View>
    </Pressable>
  );
}

/** Tela 14c: de onde vem a foto do anúncio. Modal próprio porque `Alert` não abre no navegador. */
export function FolhaAdicionarFoto({
  visivel,
  aoTirarFoto,
  aoEscolherDaGaleria,
  aoFechar,
}: FolhaAdicionarFotoProps) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <Pressable
        onPress={aoFechar}
        accessibilityLabel="Fechar"
        className="flex-1 justify-end bg-marca-900/50"
      >
        {/* Toque dentro da folha não fecha. */}
        <Pressable onPress={() => {}} className="rounded-t-sheet bg-superficie">
          <SafeAreaView edges={["bottom"]} className="gap-4 px-margem pb-2 pt-3">
            <View className="h-1 w-10 self-center rounded-full bg-borda-campo" />
            <View className="gap-1">
              <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                Adicionar foto
              </Text>
              <Text className="text-rotulo text-tinta-suave">
                Escolha de onde vem a foto do anúncio.
              </Text>
            </View>
            <Opcao
              icone={Camera}
              titulo="Tirar foto"
              descricao="Abre a câmera do celular"
              onPress={aoTirarFoto}
            />
            <Opcao
              icone={IconeGaleria}
              titulo="Escolher da galeria"
              descricao="Usa fotos já salvas no celular"
              onPress={aoEscolherDaGaleria}
            />
            <Pressable
              onPress={aoFechar}
              accessibilityRole="button"
              className="h-botao items-center justify-center active:opacity-70"
            >
              <Text className="text-corpo font-semibold text-tinta-suave">Cancelar</Text>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
