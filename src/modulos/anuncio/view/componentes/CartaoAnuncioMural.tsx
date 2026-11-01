import { Image } from "expo-image";
import { Clock, ImageIcon, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "../../../../comum/componentes/ui/Avatar";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { CartaoMuralExibido } from "../../viewmodel/useMuralViewModel";

interface CartaoAnuncioMuralProps {
  anuncio: CartaoMuralExibido;
  onPress: () => void;
}

/** Item do mural: categoria, selo "NOVO", título, Empregador, quando/onde e miniatura. */
export function CartaoAnuncioMural({ anuncio, onPress }: CartaoAnuncioMuralProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row gap-3 rounded-card border border-borda bg-superficie p-4 active:opacity-70"
    >
      <View className="flex-1 gap-2">
        <View className="flex-row flex-wrap gap-1.5">
          <View className="rounded-full bg-marca-50 px-2.5 py-1">
            <Text className="text-overline font-bold uppercase text-marca-600">
              {anuncio.categoria}
            </Text>
          </View>
          {anuncio.novo ? (
            <View className="rounded-full bg-marca-500 px-2.5 py-1">
              <Text className="text-overline font-bold uppercase text-white">Novo</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-[16px] font-bold leading-[21px] text-tinta" numberOfLines={2}>
          {anuncio.titulo}
        </Text>
        <View className="flex-row items-center gap-2">
          <Avatar
            nome={anuncio.nomeEmpregador}
            fotoUrl={anuncio.fotoEmpregadorUrl}
            tamanho={22}
          />
          <Text className="text-rotulo text-tinta-suave">{anuncio.nomeEmpregador}</Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
          <View className="flex-row items-center gap-1">
            <Icone icone={Clock} tamanho={14} cor="suave" />
            <Text className="text-rotulo text-tinta-suave">{anuncio.quando}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icone icone={MapPin} tamanho={14} cor="suave" />
            <Text className="text-rotulo text-tinta-suave">{anuncio.local}</Text>
          </View>
        </View>
      </View>
      {anuncio.fotoUrl ? (
        <Image
          source={{ uri: anuncio.fotoUrl }}
          style={{ width: 76, height: 76, borderRadius: 14 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-[76px] w-[76px] items-center justify-center rounded-campo border border-marca-100 bg-marca-50">
          <Icone icone={ImageIcon} tamanho={20} cor="marca" />
        </View>
      )}
    </Pressable>
  );
}
