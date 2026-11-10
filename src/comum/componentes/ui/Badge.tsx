import { Text, View } from "react-native";

import type { Estado } from "../../tipos/api";

const ROTULOS: Record<Estado, string> = {
  aguardando: "Aguardando candidatos",
  combinado: "Combinado",
  andamento: "Em andamento",
  validacao: "Aguardando validação",
  contestacao: "Em contestação",
  concluido: "Concluído",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const CORES: Record<Estado, { fundo: string; texto: string }> = {
  aguardando: { fundo: "bg-estado-aguardando", texto: "text-estado-aguardando-texto" },
  combinado: { fundo: "bg-estado-combinado", texto: "text-estado-combinado-texto" },
  andamento: { fundo: "bg-estado-andamento", texto: "text-estado-andamento-texto" },
  validacao: { fundo: "bg-estado-validacao", texto: "text-estado-validacao-texto" },
  contestacao: { fundo: "bg-estado-contestacao", texto: "text-estado-contestacao-texto" },
  concluido: { fundo: "bg-estado-concluido", texto: "text-estado-concluido-texto" },
  cancelado: { fundo: "bg-estado-cancelado", texto: "text-estado-cancelado-texto" },
  expirado: { fundo: "bg-estado-expirado", texto: "text-estado-expirado-texto" },
};

interface BadgeProps {
  estado: Estado;
  /**
   * Texto no lugar do rótulo padrão do estado, com as mesmas cores (ex.:
   * "Aguardando escolha" da candidatura, que usa o par de "aguardando").
   */
  rotulo?: string;
}

/** Badge de estado do anúncio — overline em caixa alta, um par de cores por estado. */
export function Badge({ estado, rotulo }: BadgeProps) {
  const cor = CORES[estado];

  return (
    <View className={`self-start rounded-full px-2.5 py-1.5 ${cor.fundo}`}>
      <Text className={`text-overline font-bold uppercase ${cor.texto}`}>
        {rotulo ?? ROTULOS[estado]}
      </Text>
    </View>
  );
}
