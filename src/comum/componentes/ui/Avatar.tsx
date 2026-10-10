import { Image } from "expo-image";
import { Text, View } from "react-native";

interface AvatarProps {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: number;
}

// Os dois tons do guia; a escolha pelo nome mantém a mesma cor pra mesma pessoa.
const FUNDOS = ["bg-marca-800", "bg-marca-700"] as const;

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return "?";
  }
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function fundoPorNome(nome: string): string {
  let soma = 0;
  for (const letra of nome) {
    soma += letra.charCodeAt(0);
  }
  return FUNDOS[soma % FUNDOS.length];
}

export function Avatar({ nome, fotoUrl, tamanho = 44 }: AvatarProps) {
  const dimensao = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };

  if (fotoUrl) {
    return (
      <Image
        source={{ uri: fotoUrl }}
        style={dimensao}
        contentFit="cover"
        accessibilityLabel={nome}
      />
    );
  }

  return (
    <View
      style={dimensao}
      className={`items-center justify-center ${fundoPorNome(nome)}`}
      accessibilityLabel={nome}
    >
      <Text
        className="font-bold text-white"
        style={{ fontSize: Math.round(tamanho * 0.34) }}
      >
        {iniciais(nome)}
      </Text>
    </View>
  );
}
