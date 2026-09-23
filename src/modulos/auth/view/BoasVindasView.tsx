import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { AneisDecorativos } from "./componentes/AneisDecorativos";

interface BoasVindasViewProps {
  aoCriarConta: () => void;
  aoEntrar: () => void;
}

export function BoasVindasView({ aoCriarConta, aoEntrar }: BoasVindasViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-marca-900" edges={["top", "bottom"]}>
      <AneisDecorativos />

      <View className="flex-1 justify-between px-6 py-8">
        <Text className="mt-10 text-center text-titulo font-extrabold text-white">
          Limio
        </Text>

        <View className="gap-3">
          <Text className="text-display font-extrabold leading-[34px] text-white">
            Alguém perto de você resolve isso hoje.
          </Text>
          <Text className="text-corpo text-white/70">
            Publique a demanda, converse com quem se candidatar e combine
            direto. Sem comissão, sem intermediário.
          </Text>
        </View>

        <View className="gap-3">
          <Botao rotulo="Criar conta" onPress={aoCriarConta} />
          <Botao
            rotulo="Já tenho conta"
            variante="secundario-claro"
            onPress={aoEntrar}
          />
          <Text className="text-center text-micro text-white/50">
            Ao continuar você aceita os{" "}
            <Text className="text-marca-300">Termos de Uso</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
