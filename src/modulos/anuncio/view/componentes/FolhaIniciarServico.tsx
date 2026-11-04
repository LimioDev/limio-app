import { CircleAlert, CircleCheck, Lock, RefreshCw, type LucideIcon } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { FolhaIniciarExibida } from "../../viewmodel/useSeuServicoViewModel";

interface FolhaIniciarServicoProps {
  folha: FolhaIniciarExibida;
  aoConfirmar: () => void;
  aoFechar: () => void;
}

function Item({ icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <View className="flex-row items-center gap-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-chip bg-marca-50">
        <Icone icone={icone} tamanho={14} cor="marca-escura" />
      </View>
      <Text className="flex-1 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

/** Tela 36b: folha de baixo sobre a tela 36 confirmando o início do serviço. */
export function FolhaIniciarServico({ folha, aoConfirmar, aoFechar }: FolhaIniciarServicoProps) {
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
                Iniciar o serviço agora?
              </Text>
              <Text className="text-rotulo text-tinta-suave">{folha.resumo}</Text>
            </View>

            {/* "Você ainda pode cancelar, se precisar." do protótipo entra com o
                "Cancelar serviço" do Prestador (ETI-97). */}
            <View className="gap-4">
              <Item icone={Lock} texto={`${empregador} não pode mais cancelar o serviço.`} />
              <Item icone={RefreshCw} texto="Ninguém pode reagendar depois de iniciar." />
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
                rotulo="Iniciar serviço"
                icone={CircleCheck}
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
