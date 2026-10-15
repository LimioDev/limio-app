import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PapelAlternavel } from "../tipos/auth.types";
import type { OpcaoPapel } from "../viewmodel/useTrocarPapelViewModel";

interface TrocarPapelViewProps {
  opcoes: OpcaoPapel[];
  aoEscolher: (papel: PapelAlternavel) => void;
  papelEmTroca: PapelAlternavel | null | undefined;
  erroServidor: string | null;
  aoFechar: () => void;
}

export function TrocarPapelView({
  opcoes,
  aoEscolher,
  papelEmTroca,
  erroServidor,
  aoFechar,
}: TrocarPapelViewProps) {
  const trocando = Boolean(papelEmTroca);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-1 gap-5 px-margem pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-titulo font-bold text-tinta">
            Usar o LIMIO como
          </Text>
          <Text
            className="text-rotulo font-semibold text-marca-500"
            onPress={aoFechar}
          >
            Fechar
          </Text>
        </View>

        <Text className="text-corpo text-tinta-suave">
          Uma conta só para os dois papéis. Você pode trocar quando quiser.
        </Text>

        <View className="gap-3">
          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.papel}
              onPress={() => aoEscolher(opcao.papel)}
              disabled={trocando}
              className={`gap-1 rounded-card border p-4 ${opcao.ativo ? "border-marca-500 bg-marca-50" : "border-borda bg-superficie"} ${trocando && papelEmTroca !== opcao.papel ? "opacity-50" : ""}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-corpo font-bold text-tinta">
                  {opcao.rotulo}
                </Text>
                {opcao.ativo ? (
                  <View className="rounded-full bg-marca-500 px-2 py-1">
                    <Text className="text-micro font-medium text-white">
                      Papel ativo
                    </Text>
                  </View>
                ) : null}
                {papelEmTroca === opcao.papel ? (
                  <ActivityIndicator color="#2159CC" />
                ) : null}
              </View>
              <Text className="text-rotulo text-tinta-suave">
                {opcao.descricao}
              </Text>
            </Pressable>
          ))}
        </View>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
