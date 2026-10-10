import { View, type ViewProps } from "react-native";

/** Sem sombra: hierarquia por borda e superfície (guia de fundamentos). */
export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={`rounded-card border border-borda bg-superficie p-4 ${className ?? ""}`}
      {...props}
    />
  );
}
