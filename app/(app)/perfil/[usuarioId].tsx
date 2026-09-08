import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Perfil() {
  const { usuarioId } = useLocalSearchParams<{ usuarioId: string }>();

  return (
    <View>
      <Text>perfil/{usuarioId}</Text>
    </View>
  );
}
