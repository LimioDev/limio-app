import { View, type ViewProps } from "react-native";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={`rounded-card border border-borda bg-fundo p-4 ${className ?? ""}`}
      {...props}
    />
  );
}
