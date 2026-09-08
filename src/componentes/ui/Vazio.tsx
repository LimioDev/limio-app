import { Text, View } from "react-native";

interface VazioProps {
  mensagem: string;
}

export function Vazio({ mensagem }: VazioProps) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-corpo text-tinta-suave">{mensagem}</Text>
    </View>
  );
}
