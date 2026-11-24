import { Calendar } from "lucide-react-native";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Masks } from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Campo } from "../../../../comum/componentes/ui/Campo";
import type { PeriodoHistorico } from "../../tipos/anuncio.enums";
import type { FolhaPeriodoExibida } from "../../viewmodel/useHistoricoViewModel";

interface FolhaPeriodoHistoricoProps {
  folha: FolhaPeriodoExibida;
  aoEscolher: (periodo: PeriodoHistorico) => void;
  aoMudarDataInicio: (texto: string) => void;
  aoMudarDataFim: (texto: string) => void;
  aoAplicar: () => void;
  aoFechar: () => void;
}

/**
 * Folha do "Trocar" (e do filtro do topo) da tela 44: atalhos de período ou
 * datas digitadas. O protótipo não desenha a folha; segue a 28a do mural.
 */
export function FolhaPeriodoHistorico({
  folha,
  aoEscolher,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoAplicar,
  aoFechar,
}: FolhaPeriodoHistoricoProps) {
  return (
    <Modal
      visible={folha.aberta}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable
          onPress={aoFechar}
          accessibilityLabel="Fechar período"
          className="absolute inset-0 bg-marca-900/40"
        />
        <SafeAreaView edges={["bottom"]} className="max-h-[90%] rounded-t-sheet bg-superficie">
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-marca-100" />
          </View>
          <ScrollView
            contentContainerClassName="gap-5 px-margem pb-4 pt-4"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
              Período
            </Text>

            <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
              {folha.opcoes.map((opcao) => (
                <Pressable
                  key={opcao.valor}
                  onPress={() => aoEscolher(opcao.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: opcao.selecionada }}
                  className={`h-10 justify-center rounded-chip border px-3.5 ${opcao.selecionada ? "border-marca-500 bg-marca-50" : "border-borda-campo bg-superficie"}`}
                >
                  <Text
                    className={`text-rotulo ${opcao.selecionada ? "font-bold text-marca-600" : "font-medium text-tinta-suave"}`}
                  >
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              ))}
            </View>

            {folha.personalizado ? (
              <View className="gap-4">
                <Campo
                  rotulo="Data inicial"
                  icone={Calendar}
                  mask={Masks.DATE_DDMMYYYY}
                  keyboardType="number-pad"
                  value={folha.dataInicio}
                  onChangeText={aoMudarDataInicio}
                  erro={folha.erros.dataInicio}
                />
                <Campo
                  rotulo="Data final"
                  icone={Calendar}
                  mask={Masks.DATE_DDMMYYYY}
                  keyboardType="number-pad"
                  value={folha.dataFim}
                  onChangeText={aoMudarDataFim}
                  erro={folha.erros.dataFim}
                />
              </View>
            ) : null}
          </ScrollView>
          <View className="px-margem pb-4 pt-2">
            <Botao rotulo="Aplicar" onPress={aoAplicar} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
