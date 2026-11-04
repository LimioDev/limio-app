import { Crown } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Progresso } from "../../../comum/componentes/ui/Progresso";
import { Plano } from "../tipos/cota.enums";
import type { FaixaCotaExibida } from "../viewmodel/useFaixaCotaViewModel";

interface FaixaCotaViewProps {
  faixa: FaixaCotaExibida;
  aoAbrirCota: () => void;
}

/**
 * Faixa do topo do mural: FREE (tela 28) abre a tela 33; GOLD (28c) só
 * informa. "Ver GOLD" e "Gerenciar" ficam de fora até a tela 34 "Assinatura"
 * (ETI-82) entrar.
 */
export function FaixaCotaView({ faixa, aoAbrirCota }: FaixaCotaViewProps) {
  if (faixa.plano === Plano.GOLD) {
    return (
      <View className="gap-0.5 rounded-card border border-gold-fundo bg-gold-fundo/50 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Icone icone={Crown} tamanho={16} cor="gold" />
          <Text className="text-corpo font-bold text-gold">GOLD ativo · escolhas ilimitadas</Text>
        </View>
        <Text className="text-rotulo text-tinta-fraco">{faixa.renovacao}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={aoAbrirCota}
      accessibilityRole="button"
      accessibilityLabel={`Plano FREE, ${faixa.usadas}. Ver cota do mês`}
      className="gap-2 rounded-card border border-borda bg-superficie px-4 py-3 active:opacity-80"
    >
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-corpo font-bold text-tinta">Plano FREE</Text>
        <Text className="text-rotulo text-tinta-suave">{faixa.usadas}</Text>
      </View>
      <Progresso atual={faixa.escolhasConsumidas} total={faixa.teto} />
      <Text className="text-rotulo text-tinta-fraco">{faixa.renovacao}</Text>
    </Pressable>
  );
}
