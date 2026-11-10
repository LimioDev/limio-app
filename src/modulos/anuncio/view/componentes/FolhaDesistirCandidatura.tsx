import { CircleAlert, CircleCheck, MessageSquare, User, type LucideIcon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { FolhaDesistirExibida } from "../../viewmodel/useAplicacoesViewModel";

interface FolhaDesistirCandidaturaProps {
  folha: FolhaDesistirExibida;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

function Item({ icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <View className="flex-row items-center gap-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-chip bg-marca-50">
        <Icone icone={icone} tamanho={14} cor="marca" />
      </View>
      <Text className="flex-1 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

function maiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Tela 32d: folha de baixo sobre a tela 32 confirmando a desistência. */
export function FolhaDesistirCandidatura({ folha, aoConfirmar, aoFechar }: FolhaDesistirCandidaturaProps) {
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
            <View className="gap-1">
              <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                Desistir desta candidatura?
              </Text>
              <Text className="text-rotulo text-tinta-suave">{folha.resumo}</Text>
            </View>

            <View className="gap-4">
              <Item icone={User} texto={`${maiuscula(empregador)} deixa de ver sua candidatura.`} />
              <Item
                icone={MessageSquare}
                texto={`O chat com ${empregador} fica em somente leitura.`}
              />
              <Item icone={CircleCheck} texto="Nenhuma escolha da sua cota é usada." />
            </View>

            {erro ? (
              <View
                className="flex-row gap-3 rounded-campo border border-perigo-borda bg-perigo-fundo p-3.5"
                accessibilityRole="alert"
              >
                <Icone icone={CircleAlert} tamanho={18} cor="perigo" />
                <Text className="flex-1 text-rotulo text-perigo">{erro}</Text>
              </View>
            ) : null}

            <View className="gap-1">
              <Botao
                rotulo="Desistir da candidatura"
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
