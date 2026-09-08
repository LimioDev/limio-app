import { Text, View } from "react-native";

import type { Estado } from "../../tipos/api";

const ROTULOS: Record<Estado, string> = {
  aguardando: "Aguardando",
  combinado: "Combinado",
  andamento: "Em andamento",
  validacao: "Em validação",
  contestacao: "Em contestação",
  concluido: "Concluído",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const CORES: Record<Estado, string> = {
  aguardando: "bg-estado-aguardando",
  combinado: "bg-estado-combinado",
  andamento: "bg-estado-andamento",
  validacao: "bg-estado-validacao",
  contestacao: "bg-estado-contestacao",
  concluido: "bg-estado-concluido",
  cancelado: "bg-estado-cancelado",
  expirado: "bg-estado-expirado",
};

interface BadgeProps {
  estado: Estado;
}

export function Badge({ estado }: BadgeProps) {
  return (
    <View className={`rounded-full px-2 py-1 ${CORES[estado]}`}>
      <Text className="text-micro font-medium text-white">
        {ROTULOS[estado]}
      </Text>
    </View>
  );
}
