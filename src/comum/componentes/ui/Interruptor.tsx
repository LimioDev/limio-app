import { Pressable, View } from "react-native";

interface InterruptorProps {
  ligado: boolean;
  aoAlternar: (ligado: boolean) => void;
  desabilitado?: boolean;
  rotuloAcessivel?: string;
}

/** Toggle do guia: trilho 48×28, botão de 20 px. */
export function Interruptor({
  ligado,
  aoAlternar,
  desabilitado = false,
  rotuloAcessivel,
}: InterruptorProps) {
  return (
    <Pressable
      onPress={() => aoAlternar(!ligado)}
      disabled={desabilitado}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={rotuloAcessivel}
      accessibilityState={{ checked: ligado, disabled: desabilitado }}
      className={`h-7 w-12 justify-center rounded-full px-1 ${ligado ? "items-end bg-marca-500" : "items-start bg-controle-desligado"} ${desabilitado ? "opacity-50" : ""}`}
    >
      <View className="h-5 w-5 rounded-full bg-white" />
    </Pressable>
  );
}
