import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function DetalheAnuncio() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>anuncio/{id}</Text>
    </View>
  );
}
