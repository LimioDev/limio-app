import { Text, TextInput, View, type TextInputProps } from "react-native";

interface CampoProps extends TextInputProps {
  rotulo: string;
  erro?: string;
}

export function Campo({ rotulo, erro, ...props }: CampoProps) {
  return (
    <View className="gap-1">
      <Text className="text-rotulo text-tinta-suave">{rotulo}</Text>
      <TextInput
        className="h-toque rounded-campo border border-borda px-3 text-corpo text-tinta"
        placeholderTextColor="#A1A1AA"
        {...props}
      />
      {erro ? <Text className="text-micro text-perigo">{erro}</Text> : null}
    </View>
  );
}
