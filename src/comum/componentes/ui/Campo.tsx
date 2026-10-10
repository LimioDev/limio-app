import type { LucideIcon } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useMaskedInputProps, type Mask } from "react-native-mask-input";

import { Icone } from "./Icone";

interface CampoProps extends TextInputProps {
  rotulo: string;
  erro?: string;
  icone?: LucideIcon;
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
  onFocus,
  onBlur,
  placeholder,
  ...props
}: CampoProps) {
  const [emFoco, setEmFoco] = useState(false);
  const mascarado = useMaskedInputProps({
    value: typeof value === "string" ? value : "",
    onChangeText,
    mask,
  });

  const corBorda = erro
    ? "border-perigo"
    : emFoco
      ? "border-marca-500"
      : "border-borda-campo";

  return (
    <View className="gap-1.5">
      <Text className="text-rotulo font-semibold text-tinta-suave">{rotulo}</Text>
      <View
        className={`h-campo flex-row items-center gap-2.5 rounded-campo bg-superficie px-4 ${corBorda} ${emFoco ? "border-[1.5px]" : "border"}`}
      >
        {icone ? (
          <Icone icone={icone} tamanho={16} cor={emFoco ? "marca" : "fraco"} />
        ) : null}
        <TextInput
          className="h-full flex-1 text-corpo text-tinta"
          placeholderTextColor="#7B87A4"
          selectionColor="#2159CC"
          onFocus={(e) => {
            setEmFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setEmFoco(false);
            onBlur?.(e);
          }}
          {...props}
          {...mascarado}
          // Sem máscara, o hook devolve `placeholder: undefined` e apagaria o informado.
          placeholder={placeholder ?? mascarado.placeholder}
        />
        {acaoDireita}
      </View>
      {erro ? <Text className="text-rotulo text-perigo">{erro}</Text> : null}
    </View>
  );
}
