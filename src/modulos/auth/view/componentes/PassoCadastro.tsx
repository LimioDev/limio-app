import { Pressable, Text, View } from "react-native";

interface PassoCadastroProps {
  titulo?: string;
  passoAtual: 1 | 2 | 3;
  totalPassos?: number;
  aoVoltar: () => void;
}

export function PassoCadastro({
  titulo,
  passoAtual,
  totalPassos = 3,
  aoVoltar,
}: PassoCadastroProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={aoVoltar}
            hitSlop={12}
            className="h-toque w-8 items-center justify-center"
          >
            <Text className="text-titulo text-tinta">‹</Text>
          </Pressable>
          {titulo ? (
            <Text className="text-titulo font-bold text-tinta">{titulo}</Text>
          ) : null}
        </View>
        <Text className="text-rotulo text-tinta-fraco">
          Passo {passoAtual} de {totalPassos}
        </Text>
      </View>
      <View className="h-1 flex-row overflow-hidden rounded-full bg-borda">
        <View
          className="h-1 rounded-full bg-marca-500"
          style={{ width: `${(passoAtual / totalPassos) * 100}%` }}
        />
      </View>
    </View>
  );
}
