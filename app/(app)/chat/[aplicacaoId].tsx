import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Chat() {
  const { aplicacaoId } = useLocalSearchParams<{ aplicacaoId: string }>();

  return (
    <View>
      <Text>chat/{aplicacaoId}</Text>
    </View>
  );
}
