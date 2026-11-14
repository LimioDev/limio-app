import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";
import { NOTA_MAX } from "../../tipos/avaliacao.types";

interface SeletorEstrelasProps {
  /** `null` enquanto nenhuma estrela foi tocada. */
  nota: number | null;
  aoEscolher: (nota: number) => void;
}

const POSICOES = Array.from({ length: NOTA_MAX }, (_, i) => i + 1);

/** Cinco estrelas tocáveis; tocar na N-ésima marca a nota N. */
export function SeletorEstrelas({ nota, aoEscolher }: SeletorEstrelasProps) {
  return (
    <View className="flex-row justify-center gap-4" accessibilityRole="radiogroup">
      {POSICOES.map((posicao) => {
        const marcada = nota !== null && posicao <= nota;
        return (
          <Pressable
            key={posicao}
            onPress={() => aoEscolher(posicao)}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityState={{ checked: nota === posicao }}
            accessibilityLabel={posicao === 1 ? "1 estrela" : `${posicao} estrelas`}
          >
            <Icone
              icone={Star}
              tamanho={36}
              cor={marcada ? "estrela" : "apagado"}
              preenchimento={marcada ? "estrela" : "apagado"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
