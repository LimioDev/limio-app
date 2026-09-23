import { ActivityIndicator, View } from "react-native";

export function Carregando() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color="#1F7A6B" />
    </View>
  );
}
