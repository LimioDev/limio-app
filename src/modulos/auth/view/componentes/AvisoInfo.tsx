import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface AvisoInfoProps {
  icone: LucideIcon;
  children: ReactNode;
}

export function AvisoInfo({ icone, children }: AvisoInfoProps) {
  return (
    <View className="flex-row items-start gap-3 rounded-card bg-marca-50 p-4">
      <Icone icone={icone} cor="marca" />
      <Text className="flex-1 text-rotulo text-tinta-suave">{children}</Text>
    </View>
  );
}
