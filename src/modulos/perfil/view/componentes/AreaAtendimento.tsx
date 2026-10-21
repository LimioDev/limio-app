import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

interface AreaAtendimentoProps {
  raio: number;
  raioMax: number;
}

const ALTURA = 168;
const PASSO_GRADE = 29;
const RAIO_MIN_DESENHO = 14;

/**
 * Desenho do raio de atendimento da tela 10: grade de fundo, círculo que
 * cresce com o raio e o ponto do município-base no centro. É ilustração, não
 * mapa: a escala é relativa ao raio máximo.
 */
export function AreaAtendimento({ raio, raioMax }: AreaAtendimentoProps) {
  const [largura, setLargura] = useState(0);
  const centroX = largura / 2;
  const centroY = ALTURA / 2;
  const raioDesenhoMax = ALTURA / 2 - 6;
  const externo =
    RAIO_MIN_DESENHO + (raio / raioMax) * (raioDesenhoMax - RAIO_MIN_DESENHO);

  const verticais = Array.from(
    { length: Math.floor(largura / PASSO_GRADE) },
    (_, i) => (i + 1) * PASSO_GRADE,
  );
  const horizontais = Array.from(
    { length: Math.floor(ALTURA / PASSO_GRADE) },
    (_, i) => (i + 1) * PASSO_GRADE,
  );

  return (
    <View
      className="overflow-hidden rounded-card border border-borda bg-superficie"
      style={{ height: ALTURA }}
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {largura > 0 ? (
        <Svg width={largura} height={ALTURA}>
          {verticais.map((x) => (
            <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={ALTURA} stroke="#EDF0F7" strokeWidth={1} />
          ))}
          {horizontais.map((y) => (
            <Line key={`h${y}`} x1={0} y1={y} x2={largura} y2={y} stroke="#EDF0F7" strokeWidth={1} />
          ))}
          <Circle
            cx={centroX}
            cy={centroY}
            r={externo}
            fill="#2159CC"
            fillOpacity={0.1}
            stroke="#7D9BF2"
            strokeWidth={1.5}
          />
          <Circle cx={centroX} cy={centroY} r={externo * 0.58} fill="#C2CEF4" fillOpacity={0.7} />
          <Circle cx={centroX} cy={centroY} r={7} fill="#2159CC" stroke="#FFFFFF" strokeWidth={2} />
        </Svg>
      ) : null}
    </View>
  );
}
