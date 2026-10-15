import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { Icone } from "./Icone";

interface ChipProps {
  rotulo: string;
  selecionado?: boolean;
  icone?: LucideIcon;
  onPress?: () => void;
}

/** Filtro/categoria em pílula. Selecionado: azul-escuro; normal: contorno neutro. */
export function Chip({ rotulo, selecionado = false, icone, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityState={{ selected: selecionado }}
      className={`h-9 flex-row items-center gap-1.5 self-start rounded-full border px-4 ${selecionado ? "border-marca-800 bg-marca-800" : "border-borda-campo bg-superficie"}`}
    >
      {icone ? (
        <Icone icone={icone} tamanho={14} cor={selecionado ? "branco" : "suave"} />
      ) : null}
      <Text
        className={`text-rotulo ${selecionado ? "font-bold text-white" : "font-medium text-tinta-suave"}`}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}
