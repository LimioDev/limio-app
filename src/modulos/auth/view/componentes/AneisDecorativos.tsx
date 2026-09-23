import { View } from "react-native";

const DIAMETROS = [260, 420, 580, 740];

/** Anéis concêntricos de fundo, puramente decorativos (tela de boas-vindas). */
export function AneisDecorativos() {
  return (
    <View
      className="absolute inset-0 items-center overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      {DIAMETROS.map((diametro) => (
        <View
          key={diametro}
          className="absolute top-0 self-center rounded-full border border-white/10"
          style={{
            width: diametro,
            height: diametro,
            marginLeft: -diametro / 2,
            marginTop: -diametro / 3,
          }}
        />
      ))}
    </View>
  );
}
