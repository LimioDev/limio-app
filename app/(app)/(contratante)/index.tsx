import { Link } from "expo-router";
import { Text, View } from "react-native";

import { SeletorPapelAtivo } from "../../../src/comum/componentes/sessao/SeletorPapelAtivo";
import { useCabecalhoInicioViewModel } from "../../../src/modulos/perfil/viewmodel/useCabecalhoInicioViewModel";
import { CabecalhoInicioView } from "../../../src/modulos/perfil/view/CabecalhoInicioView";

export default function MeusAnuncios() {
  const cabecalho = useCabecalhoInicioViewModel();

  return (
    <View className="flex-1 gap-4 px-margem py-6">
      <CabecalhoInicioView {...cabecalho} />
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
