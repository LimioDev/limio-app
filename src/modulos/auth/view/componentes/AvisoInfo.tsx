import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface AvisoInfoProps {
  glifo: string;
  children: ReactNode;
}

export function AvisoInfo({ glifo, children }: AvisoInfoProps) {
  return (
    <View className="flex-row items-start gap-3 rounded-card bg-marca-50 p-4">
      <Text className="text-corpo">{glifo}</Text>
      <Text className="flex-1 text-rotulo text-tinta-suave">{children}</Text>
    </View>
  );
}
