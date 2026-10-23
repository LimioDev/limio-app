import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface CampoSelecaoProps {
  rotulo: string;
  valor: string | null;
  placeholder: string;
  onPress: () => void;
  erro?: string;
}

/** Mesmo visual do `Campo`, mas abre outra tela pra escolher o valor. */
export function CampoSelecao({ rotulo, valor, placeholder, onPress, erro }: CampoSelecaoProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-rotulo font-semibold text-tinta-suave">{rotulo}</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${valor ?? placeholder}`}
        className={`h-campo flex-row items-center gap-2 rounded-campo border bg-superficie px-4 active:opacity-70 ${erro ? "border-perigo" : "border-borda-campo"}`}
      >
        <Text
          className={`flex-1 text-corpo ${valor ? "text-tinta" : "text-tinta-fraco"}`}
          numberOfLines={1}
        >
          {valor ?? placeholder}
        </Text>
        <Icone icone={ChevronRight} tamanho={18} cor="fraco" />
      </Pressable>
      {erro ? <Text className="text-rotulo text-perigo">{erro}</Text> : null}
    </View>
  );
}
