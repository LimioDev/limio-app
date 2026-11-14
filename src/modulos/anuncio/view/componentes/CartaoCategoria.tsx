import { ChevronRight, Wrench } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface CartaoCategoriaProps {
  categoria: string | null;
  aoTrocar: () => void;
  erro?: string;
}

/** Categoria do anúncio (telas 14 e 16a): "Escolher categoria" vazio, ou a escolhida com "Trocar". */
export function CartaoCategoria({ categoria, aoTrocar, erro }: CartaoCategoriaProps) {
  if (!categoria) {
    return (
      <Pressable
        onPress={aoTrocar}
        accessibilityRole="button"
        accessibilityLabel="Escolher categoria"
        className={`h-[62px] flex-row items-center gap-3 rounded-campo border bg-superficie px-3 active:opacity-80 ${erro ? "border-perigo" : "border-borda-campo"}`}
      >
        <View className="h-9 w-9 items-center justify-center rounded-chip bg-marca-50">
          <Icone icone={Wrench} tamanho={16} cor="marca" />
        </View>
        <Text className="flex-1 text-corpo text-tinta-fraco">Escolher categoria</Text>
        <Icone icone={ChevronRight} tamanho={18} cor="fraco" />
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={aoTrocar}
      accessibilityRole="button"
      accessibilityLabel={`Categoria: ${categoria}. Trocar`}
      className={`h-[62px] flex-row items-center gap-3 rounded-campo border-[1.5px] bg-marca-50 px-3 active:opacity-80 ${erro ? "border-perigo" : "border-marca-500"}`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-chip bg-marca-500">
        <Icone icone={Wrench} tamanho={16} cor="branco" />
      </View>
      <Text className="flex-1 text-corpo font-bold text-marca-500" numberOfLines={1}>
        {categoria}
      </Text>
      <Text className="text-corpo font-bold text-marca-500">Trocar</Text>
    </Pressable>
  );
}
