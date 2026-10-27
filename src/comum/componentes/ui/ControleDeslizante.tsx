import { useState } from "react";
import { View, type GestureResponderEvent } from "react-native";

interface ControleDeslizanteProps {
  valor: number;
  min: number;
  max: number;
  aoMudar: (valor: number) => void;
  rotuloAcessivel: string;
  /** Texto lido pelo leitor de tela, ex.: "12 km". */
  textoValor: string;
}

const DIAMETRO_PINO = 28;

/**
 * Slider de passo 1 (trilho de 4 px, pino de 28 px, como no protótipo). Feito
 * com o responder do próprio `View` porque o projeto não tem lib de slider.
 * Acessível como "adjustable": o leitor de tela sobe e desce de 1 em 1. Em
 * `comum/` porque o perfil de atuação e os filtros do mural usam.
 */
export function ControleDeslizante({
  valor,
  min,
  max,
  aoMudar,
  rotuloAcessivel,
  textoValor,
}: ControleDeslizanteProps) {
  const [largura, setLargura] = useState(0);

  const limitar = (v: number) => Math.min(Math.max(v, min), max);

  // Os filhos não recebem toque (`pointerEvents="none"`), então `locationX` é
  // sempre relativo ao trilho.
  const mover = (evento: GestureResponderEvent) => {
    if (largura === 0) {
      return;
    }
    const fracao = evento.nativeEvent.locationX / largura;
    const novo = limitar(Math.round(min + fracao * (max - min)));
    if (novo !== valor) {
      aoMudar(novo);
    }
  };

  const fracao = max > min ? (limitar(valor) - min) / (max - min) : 0;
  const posicao = fracao * largura;

  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Não deixa a ScrollView roubar o arraste horizontal.
      onResponderTerminationRequest={() => false}
      onResponderGrant={mover}
      onResponderMove={mover}
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
      className="h-toque justify-center"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={rotuloAcessivel}
      accessibilityValue={{ min, max, now: valor, text: textoValor }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        const passo = e.nativeEvent.actionName === "increment" ? 1 : -1;
        aoMudar(limitar(valor + passo));
      }}
    >
      <View pointerEvents="none" className="h-1 rounded-full bg-borda">
        <View className="h-1 rounded-full bg-marca-500" style={{ width: posicao }} />
      </View>
      <View
        pointerEvents="none"
        className="absolute rounded-full border-[2.5px] border-marca-500 bg-superficie"
        style={{
          width: DIAMETRO_PINO,
          height: DIAMETRO_PINO,
          left: posicao - DIAMETRO_PINO / 2,
        }}
      />
    </View>
  );
}
