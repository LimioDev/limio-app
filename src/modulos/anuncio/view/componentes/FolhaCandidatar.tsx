import { CircleAlert, CircleCheck, Lock, MessageSquare, X, type LucideIcon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { FolhaCandidatarExibida } from "../../viewmodel/useDetalheAnuncioMuralViewModel";

interface FolhaCandidatarProps {
  folha: FolhaCandidatarExibida;
  aoConfirmar: () => void;
  aoFechar: () => void;
  aoAtalhoErro: () => void;
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

/** Tela 31: folha de baixo sobre a tela 30 confirmando a candidatura. */
export function FolhaCandidatar({ folha, aoConfirmar, aoFechar, aoAtalhoErro }: FolhaCandidatarProps) {
  const { empregador, enviando, erro } = folha;
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
            <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
              Candidatar-se a este serviço?
            </Text>

            <View className="gap-4">
              <Item
                icone={MessageSquare}
                texto={`Abre um chat direto com ${empregador} para combinar escopo e valor.`}
              />
              <Item
                icone={CircleCheck}
                texto={`Esta candidatura é gratuita. Sua cota mensal só é usada se ${empregador} escolher sua candidatura.`}
              />
              <Item
                icone={Lock}
                texto={`Os dados de contato de ${empregador} só aparecem se sua candidatura for escolhida.`}
              />
              <Item
                icone={X}
                texto="Você pode cancelar sua candidatura a qualquer momento antes da escolha final."
              />
            </View>

            {erro ? (
              <View
                className="flex-row gap-3 rounded-campo border border-perigo-borda bg-perigo-fundo p-3.5"
                accessibilityRole="alert"
              >
                <Icone icone={CircleAlert} tamanho={18} cor="perigo" />
                <View className="flex-1 gap-1">
                  <Text className="text-rotulo text-perigo">{erro.mensagem}</Text>
                  {erro.atalho ? (
                    <Text
                      onPress={aoAtalhoErro}
                      accessibilityRole="link"
                      className="text-rotulo font-bold text-perigo underline"
                    >
                      {erro.atalho}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View className="gap-1">
              <Botao
                rotulo="Confirmar candidatura"
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
                  Agora não
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
