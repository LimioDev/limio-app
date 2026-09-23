import type { ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useMaskedInputProps, type Mask } from "react-native-mask-input";

interface CampoProps extends TextInputProps {
  rotulo: string;
  erro?: string;
  icone?: ReactNode;
  acaoDireita?: ReactNode;
  mask?: Mask;
}

export function Campo({
  rotulo,
  erro,
  icone,
  acaoDireita,
  mask,
  value,
  onChangeText,
  ...props
}: CampoProps) {
  const mascarado = useMaskedInputProps({
    value: typeof value === "string" ? value : "",
    onChangeText,
    mask,
  });

  return (
    <View className="gap-1">
      <Text className="text-rotulo text-tinta-suave">{rotulo}</Text>
      <View
        className={`flex-row items-center rounded-campo border px-3 ${erro ? "border-perigo" : "border-borda"}`}
      >
        {icone ? <View className="mr-2">{icone}</View> : null}
        <TextInput
          className="h-toque flex-1 text-corpo text-tinta"
          placeholderTextColor="#A1A1AA"
          {...props}
          {...mascarado}
        />
        {acaoDireita ? <View className="ml-2">{acaoDireita}</View> : null}
      </View>
      {erro ? <Text className="text-micro text-perigo">{erro}</Text> : null}
    </View>
  );
}
