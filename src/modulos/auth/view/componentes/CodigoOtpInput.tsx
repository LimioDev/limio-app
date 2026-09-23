import { useRef } from "react";
import { TextInput, View } from "react-native";

interface CodigoOtpInputProps {
  valor: string;
  aoAlterar: (valor: string) => void;
  tamanho?: number;
}

export function CodigoOtpInput({
  valor,
  aoAlterar,
  tamanho = 6,
}: CodigoOtpInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);

  function alterarDigito(indice: number, digito: string) {
    const digitos = valor.split("");
    digitos[indice] = digito;
    const novoValor = digitos.join("").slice(0, tamanho);
    aoAlterar(novoValor);

    if (digito && indice < tamanho - 1) {
      refs.current[indice + 1]?.focus();
    }
  }

  function aoApagar(indice: number, tecla: string) {
    if (tecla === "Backspace" && !valor[indice] && indice > 0) {
      refs.current[indice - 1]?.focus();
    }
  }

  return (
    <View className="flex-row justify-between gap-2">
      {Array.from({ length: tamanho }).map((_, indice) => {
        const focoAtual = indice === valor.length;
        return (
          <TextInput
            key={indice}
            ref={(ref) => {
              refs.current[indice] = ref;
            }}
            value={valor[indice] ?? ""}
            onChangeText={(texto) => alterarDigito(indice, texto.slice(-1))}
            onKeyPress={({ nativeEvent }) => aoApagar(indice, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            className={`h-14 w-0 flex-1 rounded-campo border text-center text-titulo font-bold text-tinta ${
              focoAtual ? "border-marca-500" : "border-borda"
            }`}
          />
        );
      })}
    </View>
  );
}
