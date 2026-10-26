import { Text, View } from "react-native";

import { CabecalhoVoltar } from "../../../../comum/componentes/ui/CabecalhoVoltar";
import { Progresso } from "../../../../comum/componentes/ui/Progresso";

interface CabecalhoPassoProps {
  passo: number;
  total: number;
  aoVoltar: () => void;
}

/** Topo das telas 14 e 15: "1 de 2", voltar com o título e a barra de progresso. */
export function CabecalhoPasso({ passo, total, aoVoltar }: CabecalhoPassoProps) {
  return (
    <View className="gap-1 pb-3">
      <Text className="px-margem pt-2 text-right text-rotulo font-semibold text-tinta-fraco">
        {passo} de {total}
      </Text>
      <CabecalhoVoltar titulo="Novo anúncio" aoVoltar={aoVoltar} />
      <View className="px-margem pt-1">
        <Progresso atual={passo} total={total} />
      </View>
    </View>
  );
}
