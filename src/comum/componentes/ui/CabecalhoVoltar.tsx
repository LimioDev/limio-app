import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Icone } from "./Icone";

interface CabecalhoVoltarProps {
  titulo: string;
  aoVoltar: () => void;
  direita?: ReactNode;
}

/** Topo das telas empilhadas (perfil, anúncio): seta de voltar e título. */
export function CabecalhoVoltar({ titulo, aoVoltar, direita }: CabecalhoVoltarProps) {
  return (
    <View className="flex-row items-center gap-1 px-margem pt-2">
      <Pressable
        onPress={aoVoltar}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="h-toque w-8 items-center justify-center"
      >
        <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
      </Pressable>
      <Text className="flex-1 text-secao font-bold text-tinta" accessibilityRole="header">
        {titulo}
      </Text>
      {direita}
    </View>
  );
}
