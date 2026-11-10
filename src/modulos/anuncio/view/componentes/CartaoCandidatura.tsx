import { Pressable, Text, View } from "react-native";

import { Badge } from "../../../../comum/componentes/ui/Badge";
import type { CandidaturaExibida } from "../../viewmodel/useAplicacoesViewModel";

interface CartaoCandidaturaProps {
  candidatura: CandidaturaExibida;
  aoCancelar: () => void;
  aoVerDetalhes: () => void;
}

/** Item da tela 32: selo, data e hora, título, Empregador e o link da ação. */
export function CartaoCandidatura({ candidatura, aoCancelar, aoVerDetalhes }: CartaoCandidaturaProps) {
  const { acao } = candidatura;

  return (
    <View className="gap-2 rounded-card border border-borda bg-superficie p-4">
      <View className="flex-row items-center justify-between gap-3">
        <Badge estado={candidatura.estado} rotulo={candidatura.selo} />
        <Text className="text-rotulo font-semibold text-tinta-fraco">{candidatura.quando}</Text>
      </View>
      <Text className="text-corpo font-bold text-tinta" numberOfLines={2}>
        {candidatura.titulo}
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <View
            className="h-6 w-6 items-center justify-center rounded-full bg-marca-800"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text className="text-[9px] font-bold text-white">
              {candidatura.iniciaisEmpregador}
            </Text>
          </View>
          <Text className="flex-1 text-rotulo text-tinta-suave" numberOfLines={1}>
            {candidatura.nomeEmpregador}
          </Text>
        </View>
        {acao === "cancelar" ? (
          <Pressable
            onPress={aoCancelar}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Cancelar candidatura: ${candidatura.titulo}`}
            className="active:opacity-70"
          >
            <Text className="text-corpo font-bold text-perigo">Cancelar</Text>
          </Pressable>
        ) : null}
        {acao === "detalhes" ? (
          <Pressable
            onPress={aoVerDetalhes}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes: ${candidatura.titulo}`}
            className="active:opacity-70"
          >
            <Text className="text-corpo font-bold text-marca-500">Ver Detalhes</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
