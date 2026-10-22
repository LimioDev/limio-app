import { Camera } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Avatar } from "../../../../comum/componentes/ui/Avatar";
import { Icone } from "../../../../comum/componentes/ui/Icone";

interface FotoPerfilEditavelProps {
  nome: string;
  fotoUrl: string | null;
  enviando: boolean;
  aoTrocar: () => void;
  tamanho?: number;
}

/**
 * Avatar de "Meu perfil" (tela 08) com o selo de câmera. A foto (ou as
 * iniciais) inteira é tocável; enquanto envia, mostra carregando por cima e
 * ignora toques.
 */
export function FotoPerfilEditavel({
  nome,
  fotoUrl,
  enviando,
  aoTrocar,
  tamanho = 72,
}: FotoPerfilEditavelProps) {
  return (
    <Pressable
      onPress={aoTrocar}
      disabled={enviando}
      accessibilityRole="button"
      accessibilityLabel="Trocar foto de perfil"
      accessibilityState={{ disabled: enviando, busy: enviando }}
      hitSlop={6}
      className="active:opacity-80"
      style={{ width: tamanho, height: tamanho }}
    >
      <Avatar nome={nome} fotoUrl={fotoUrl} tamanho={tamanho} />

      {enviando ? (
        <View
          className="absolute inset-0 items-center justify-center bg-tinta/50"
          style={{ borderRadius: tamanho / 2 }}
          testID="foto-perfil-enviando"
        >
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : null}

      <View className="absolute -bottom-0.5 -right-0.5 h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-fundo bg-marca-500">
        <Icone icone={Camera} tamanho={14} cor="branco" />
      </View>
    </Pressable>
  );
}
