import { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface CampoContadorProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  /** Sem máximo, o campo não tem contador (ex.: observações). */
  maximo?: number;
  /** Texto à direita do rótulo, ex.: "obrigatório · 5 a 80 caracteres". */
  dica?: string;
  placeholder?: string;
  /** Caixa alta de várias linhas (descrição); sem isso, uma linha só (título). */
  multilinha?: boolean;
  /** Rótulo em overline (seções da tela 14) ou como o do `Campo` (detalhes da tela 15). */
  estiloRotulo?: "overline" | "campo";
  erro?: string;
}

/** Campo de texto das telas do anúncio, com o contador "N / máximo" dentro da caixa. */
export function CampoContador({
  rotulo,
  valor,
  aoMudar,
  maximo,
  dica,
  placeholder,
  multilinha = false,
  estiloRotulo = "overline",
  erro,
}: CampoContadorProps) {
  const [emFoco, setEmFoco] = useState(false);
  const corBorda = erro ? "border-perigo" : emFoco ? "border-marca-500" : "border-borda-campo";

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className={
            estiloRotulo === "overline"
              ? "text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco"
              : "text-rotulo font-semibold text-tinta-suave"
          }
        >
          {rotulo}
        </Text>
        {dica ? <Text className="text-rotulo text-tinta-fraco">{dica}</Text> : null}
      </View>
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
          className={`text-corpo text-tinta ${multilinha ? "min-h-[64px]" : "h-full flex-1"}`}
        />
        {maximo !== undefined ? (
          <Text
            className={`text-rotulo ${erro ? "text-perigo" : "text-tinta-fraco"} ${multilinha ? "self-end" : ""}`}
          >
            {valor.length} / {maximo}
          </Text>
        ) : null}
      </View>
      {erro ? <Text className="text-rotulo text-perigo">{erro}</Text> : null}
    </View>
  );
}
