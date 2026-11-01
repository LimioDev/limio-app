import { MessageSquare, User, type LucideIcon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { FolhaRecusarExibida } from "../../viewmodel/useCandidatosViewModel";

interface FolhaRecusarCandidatoProps {
  folha: FolhaRecusarExibida;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

function Item({ icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <View className="flex-row items-center gap-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={icone} tamanho={14} cor="marca-escura" />
      </View>
      <Text className="flex-1 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

/** Tela 18b: folha de baixo sobre a tela 18 confirmando a recusa. */
export function FolhaRecusarCandidato({ folha, aoConfirmar, aoFechar }: FolhaRecusarCandidatoProps) {
  const { nome, primeiroNome, enviando } = folha;
  // Durante a chamada a folha não fecha: o resultado ainda vai mudar a tela.
  const fechar = enviando ? () => {} : aoFechar;

  return (
    <Modal
      visible={folha.aberta}
      transparent
      animationType="slide"
      onRequestClose={fechar}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          onPress={fechar}
          accessibilityLabel="Fechar"
          className="absolute inset-0 bg-marca-900/40"
        />
        <SafeAreaView edges={["bottom"]} className="rounded-t-sheet bg-superficie">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-marca-100" />
          </View>
          <View className="gap-5 px-margem pb-4 pt-4">
            <View className="gap-1.5">
              <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
                Recusar {nome}?
              </Text>
              <Text className="text-corpo text-tinta-suave">
                {primeiroNome} deixa de ver este anúncio e o chat fica só leitura.
              </Text>
            </View>

            <View className="gap-4">
              <Item icone={User} texto="Os outros candidatos continuam disponíveis." />
              <Item
                icone={MessageSquare}
                texto={`A conversa com ${primeiroNome} fica salva para consulta.`}
              />
            </View>

            <View className="gap-1">
              <Botao
                rotulo="Recusar candidatura"
                variante="destrutivo"
                carregando={enviando}
                disabled={enviando}
                onPress={aoConfirmar}
              />
              <Pressable
                onPress={aoFechar}
                disabled={enviando}
                accessibilityRole="button"
                className="items-center py-3 active:opacity-70"
              >
                <Text
                  className={`text-corpo font-semibold ${enviando ? "text-tinta-fraco" : "text-tinta-suave"}`}
                >
                  Voltar
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
