import { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface CampoContadorProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  maximo: number;
  placeholder?: string;
  /** Caixa alta de várias linhas (descrição); sem isso, uma linha só (título). */
  multilinha?: boolean;
  erro?: string;
}

/** Campo das telas do anúncio: rótulo em overline e contador "N / máximo" dentro da caixa. */
export function CampoContador({
  rotulo,
  valor,
  aoMudar,
  maximo,
  placeholder,
  multilinha = false,
  erro,
}: CampoContadorProps) {
  const [emFoco, setEmFoco] = useState(false);
  const corBorda = erro ? "border-perigo" : emFoco ? "border-marca-500" : "border-borda-campo";

  return (
    <View className="gap-2">
      <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
        {rotulo}
      </Text>
      <View
        className={`rounded-campo bg-superficie px-4 ${multilinha ? "pb-3 pt-3.5" : "h-campo flex-row items-center gap-2"} ${corBorda} ${emFoco ? "border-[1.5px]" : "border"}`}
      >
        <TextInput
          value={valor}
          onChangeText={aoMudar}
          onFocus={() => setEmFoco(true)}
          onBlur={() => setEmFoco(false)}
          placeholder={placeholder}
          placeholderTextColor="#7B87A4"
          selectionColor="#2159CC"
          maxLength={maximo}
          multiline={multilinha}
          textAlignVertical={multilinha ? "top" : "center"}
          autoCapitalize="sentences"
          accessibilityLabel={rotulo}
          className={`text-corpo text-tinta ${multilinha ? "min-h-[84px]" : "h-full flex-1"}`}
        />
        <Text className={`text-rotulo text-tinta-fraco ${multilinha ? "self-end" : ""}`}>
          {valor.length} / {maximo}
        </Text>
      </View>
      {erro ? <Text className="text-rotulo text-perigo">{erro}</Text> : null}
    </View>
  );
}
