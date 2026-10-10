import type { LucideIcon } from "lucide-react-native";

// Mesmos valores do tailwind.config.js — o SVG recebe a cor como prop, não por className.
export const CORES_ICONE = {
  tinta: "#0B1226",
  suave: "#4A5675",
  fraco: "#7B87A4",
  marca: "#2159CC",
  "marca-escura": "#0F1F4C",
  perigo: "#8C2A20",
  estrela: "#C79A2E",
  branco: "#FFFFFF",
} as const;

export type CorIcone = keyof typeof CORES_ICONE;

interface IconeProps {
  icone: LucideIcon;
  tamanho?: number;
  cor?: CorIcone;
  /** Cor de preenchimento — só pra ícone sólido (ex.: estrela da reputação). */
  preenchimento?: CorIcone;
}

/** Iconografia do guia de fundamentos: Lucide, traço de 1,7 px fixo, cantos arredondados, grade de 24. */
export function Icone({
  icone: Componente,
  tamanho = 20,
  cor = "fraco",
  preenchimento,
}: IconeProps) {
  return (
    <Componente
      size={tamanho}
      color={CORES_ICONE[cor]}
      fill={preenchimento ? CORES_ICONE[preenchimento] : "none"}
      strokeWidth={1.7}
      absoluteStrokeWidth
    />
  );
}
