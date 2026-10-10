import { Text, View } from "react-native";

interface ProgressoProps {
  atual: number;
  total: number;
  /** Ex.: "2 de 4 escolhas usadas". */
  rotulo?: string;
}

export function Progresso({ atual, total, rotulo }: ProgressoProps) {
  const fracao = total > 0 ? Math.min(Math.max(atual / total, 0), 1) : 0;

  return (
    <View
      className="gap-1.5"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: atual }}
    >
      <View className="h-1 overflow-hidden rounded-full bg-borda">
        <View
          className="h-1 rounded-full bg-marca-500"
          style={{ width: `${fracao * 100}%` }}
        />
      </View>
      {rotulo ? <Text className="text-micro text-tinta-fraco">{rotulo}</Text> : null}
    </View>
  );
}
