import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Servico() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>servico/{id}</Text>
    </View>
  );
}
