import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { CORES_ICONE, Icone, type CorIcone } from "./Icone";

type VarianteBotao =
  | "primario"
  | "escuro"
  | "contorno"
  | "neutro"
  | "destrutivo"
  /** Contorno claro sobre fundo escuro (ex.: Boas-vindas). */
  | "contorno-claro";

interface BotaoProps extends PressableProps {
  rotulo: string;
  variante?: VarianteBotao;
  icone?: LucideIcon;
  /** `acao` (54 px) é a ação principal fixa no rodapé; `padrao` (48 px) o resto. */
  tamanho?: "acao" | "padrao";
  carregando?: boolean;
}

const ESTILOS: Record<
  VarianteBotao,
  { contorno: string; texto: string; corIcone: CorIcone }
> = {
  primario: {
    contorno: "border-marca-500 bg-marca-500",
    texto: "text-white",
    corIcone: "branco",
  },
  escuro: {
    contorno: "border-marca-800 bg-marca-800",
    texto: "text-white",
    corIcone: "branco",
  },
  contorno: {
    contorno: "border-marca-100 bg-superficie",
    texto: "text-marca-500",
    corIcone: "marca",
  },
  neutro: {
    contorno: "border-borda-campo bg-superficie",
    texto: "text-tinta-suave",
    corIcone: "suave",
  },
  destrutivo: {
    contorno: "border-perigo-borda bg-superficie",
    texto: "text-perigo",
    corIcone: "perigo",
  },
  "contorno-claro": {
    contorno: "border-white/40 bg-transparent",
    texto: "text-white",
    corIcone: "branco",
  },
};

export function Botao({
  rotulo,
  variante = "primario",
  icone,
  tamanho = "acao",
  carregando = false,
  disabled,
  ...props
}: BotaoProps) {
  const estilo = ESTILOS[variante];
  const desabilitado = disabled || carregando;

  return (
    <Pressable
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado, busy: carregando }}
      className={`flex-row items-center justify-center gap-2 rounded-campo border px-5 active:opacity-80 ${tamanho === "acao" ? "h-acao" : "h-botao"} ${estilo.contorno} ${desabilitado ? "opacity-50" : ""}`}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={CORES_ICONE[estilo.corIcone]} />
      ) : icone ? (
        <Icone icone={icone} tamanho={18} cor={estilo.corIcone} />
      ) : null}
      <Text className={`text-corpo font-semibold ${estilo.texto}`}>{rotulo}</Text>
    </Pressable>
  );
}
