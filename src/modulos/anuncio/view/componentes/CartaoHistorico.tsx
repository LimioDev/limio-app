import { Star } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Badge } from "../../../../comum/componentes/ui/Badge";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { ItemHistoricoExibido } from "../../viewmodel/useHistoricoViewModel";

interface CartaoHistoricoProps {
  item: ItemHistoricoExibido;
  aoAvaliar: () => void;
}

/** Estrelas da nota recebida, sem o texto da média (a `Reputacao` é da média). */
function Estrelas({ nota }: { nota: number }) {
  return (
    <View className="flex-row gap-0.5" accessibilityLabel={`Nota recebida: ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((posicao) => (
        <Icone
          key={posicao}
          icone={Star}
          tamanho={14}
          cor={posicao <= nota ? "estrela" : "apagado"}
          preenchimento={posicao <= nota ? "estrela" : undefined}
        />
      ))}
    </View>
  );
}

/** Item da tela 44: título, data e prestador, selo, estrelas e "Avaliar". */
export function CartaoHistorico({ item, aoAvaliar }: CartaoHistoricoProps) {
  return (
    <View className="gap-2 rounded-card border border-borda bg-superficie p-4">
      <View className="gap-0.5">
        <Text className="text-corpo font-bold text-tinta" numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text className="text-rotulo text-tinta-suave" numberOfLines={1}>
          {item.detalhe}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <Badge estado={item.estado} />
          {item.nota !== null ? <Estrelas nota={item.nota} /> : null}
        </View>
        {item.podeAvaliar ? (
          <Pressable
            onPress={aoAvaliar}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Avaliar: ${item.titulo}`}
            className="active:opacity-70"
          >
            <Text className="text-corpo font-bold text-marca-500">Avaliar</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
