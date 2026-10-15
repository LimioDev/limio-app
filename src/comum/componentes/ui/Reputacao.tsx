import { Star } from "lucide-react-native";
import { Text, View } from "react-native";

import { Icone } from "./Icone";

interface ReputacaoProps {
  /** Média de 0 a 5. */
  nota: number;
  totalAvaliacoes: number;
}

const formatoNota = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Estrelas + "4,8 · 23 avaliações". */
export function Reputacao({ nota, totalAvaliacoes }: ReputacaoProps) {
  const cheias = Math.round(Math.min(Math.max(nota, 0), 5));
  const textoTotal =
    totalAvaliacoes === 1 ? "1 avaliação" : `${totalAvaliacoes} avaliações`;

  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityLabel={`Nota ${formatoNota.format(nota)} de 5, ${textoTotal}`}
    >
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((posicao) => (
          <Icone
            key={posicao}
            icone={Star}
            tamanho={14}
            cor={posicao <= cheias ? "estrela" : "fraco"}
            preenchimento={posicao <= cheias ? "estrela" : undefined}
          />
        ))}
      </View>
      <Text className="text-rotulo text-tinta-suave">
        {formatoNota.format(nota)} · {textoTotal}
      </Text>
    </View>
  );
}
