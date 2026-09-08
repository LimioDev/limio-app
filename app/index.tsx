import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-fundo">
      <Text>index</Text>
      <View className="rounded-card bg-marca-500 px-4 py-2">
        <Text className="text-corpo font-semibold text-white">
          teste nativewind
        </Text>
      </View>
    </View>
  );
}
