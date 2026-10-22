import { Text, View } from "react-native";

import { Avatar } from "../../../comum/componentes/ui/Avatar";

interface CabecalhoInicioViewProps {
  nome: string;
  saudacao: string;
  dataHoje: string;
  fotoUrl: string | null;
}

/** Foto + data + "Olá, <nome>" no topo do "Início" (tela 13). */
export function CabecalhoInicioView({
  nome,
  saudacao,
  dataHoje,
  fotoUrl,
}: CabecalhoInicioViewProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Avatar nome={nome || "?"} fotoUrl={fotoUrl} tamanho={44} />
      <View className="flex-1">
        <Text className="text-rotulo text-tinta-fraco">{dataHoje}</Text>
        <Text className="text-[20px] font-bold leading-[24px] text-tinta" numberOfLines={1}>
          {saudacao}
        </Text>
      </View>
    </View>
  );
}
