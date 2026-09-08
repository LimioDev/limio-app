import { Pressable, Text, type PressableProps } from "react-native";

interface BotaoProps extends PressableProps {
  rotulo: string;
}

export function Botao({ rotulo, ...props }: BotaoProps) {
  return (
    <Pressable
      className="h-toque items-center justify-center rounded-campo bg-marca-500 px-4"
      {...props}
    >
      <Text className="text-corpo font-semibold text-white">{rotulo}</Text>
    </Pressable>
  );
}
