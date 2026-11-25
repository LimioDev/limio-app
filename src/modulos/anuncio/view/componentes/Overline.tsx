import { Text } from "react-native";

interface OverlineProps {
  children: string;
  /** Classe de cor do Tailwind; `text-tinta-fraco` por padrão. */
  cor?: string;
}

/** Rótulo de seção em caixa alta ("DATA", "PROPOSTA") das telas do anúncio. */
export function Overline({ children, cor = "text-tinta-fraco" }: OverlineProps) {
  return (
    <Text className={`text-overline font-bold uppercase tracking-[0.8px] ${cor}`}>{children}</Text>
  );
}
