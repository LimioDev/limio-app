import { Pressable, Text, type PressableProps } from "react-native";

interface BotaoProps extends PressableProps {
  rotulo: string;
  variante?: "primario" | "secundario" | "secundario-claro";
}

const ESTILOS: Record<
  NonNullable<BotaoProps["variante"]>,
  { contorno: string; texto: string }
> = {
  primario: { contorno: "border-marca-500 bg-marca-500", texto: "text-white" },
  secundario: { contorno: "border-borda bg-fundo", texto: "text-marca-500" },
  "secundario-claro": {
    contorno: "border-white/40 bg-transparent",
    texto: "text-white",
  },
};

export function Botao({ rotulo, variante = "primario", disabled, ...props }: BotaoProps) {
  const estilo = ESTILOS[variante];

  return (
    <Pressable
      disabled={disabled}
      className={`h-toque items-center justify-center rounded-campo border px-4 ${estilo.contorno} ${disabled ? "opacity-50" : ""}`}
      {...props}
    >
      <Text className={`text-corpo font-semibold ${estilo.texto}`}>{rotulo}</Text>
    </Pressable>
  );
}
