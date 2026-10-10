import { Link } from "expo-router";
import { Text, View } from "react-native";

import { SeletorPapelAtivo } from "../../../src/comum/componentes/sessao/SeletorPapelAtivo";

export default function MeusAnuncios() {
  return (
    <View className="flex-1 gap-4 px-margem py-6">
      <View className="flex-row items-center justify-between">
        <SeletorPapelAtivo />
        <Link href="/(app)/ajustes" className="text-rotulo font-semibold text-marca-500">
          Ajustes
        </Link>
      </View>
      <Text>(contratante)/index</Text>
    </View>
  );
}
