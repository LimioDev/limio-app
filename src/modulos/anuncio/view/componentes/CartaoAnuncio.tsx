import { Image } from "expo-image";
import { ChevronRight, Clock, ImageIcon, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Badge } from "../../../../comum/componentes/ui/Badge";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { AnuncioExibido } from "../../viewmodel/usePainelEmpregadorViewModel";

interface CartaoAnuncioProps {
  anuncio: AnuncioExibido;
  onPress: () => void;
}

/** Item de "Seus anúncios": foto, descrição, quando/onde, selo de status e candidatos. */
export function CartaoAnuncio({ anuncio, onPress }: CartaoAnuncioProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="gap-4 rounded-card border border-borda bg-superficie p-4 active:opacity-70"
    >
      <View className="flex-row gap-3">
        {anuncio.fotoUrl ? (
          <Image
            source={{ uri: anuncio.fotoUrl }}
            style={{ width: 56, height: 56, borderRadius: 14 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-campo border border-marca-100 bg-marca-50">
            <Icone icone={ImageIcon} tamanho={18} cor="marca" />
          </View>
        )}
        <View className="flex-1 gap-1.5">
          <Text className="text-corpo font-bold text-tinta" numberOfLines={2}>
            {anuncio.descricao}
          </Text>
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
            <View className="flex-row items-center gap-1">
              <Icone icone={Clock} tamanho={14} cor="suave" />
              <Text className="text-rotulo text-tinta-suave">{anuncio.quando}</Text>
            </View>
            {anuncio.bairro ? (
              <View className="flex-row items-center gap-1">
                <Icone icone={MapPin} tamanho={14} cor="suave" />
                <Text className="text-rotulo text-tinta-suave">{anuncio.bairro}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Icone icone={ChevronRight} tamanho={20} cor="suave" />
      </View>
      <View className="flex-row items-center gap-3">
        <Badge estado={anuncio.estado} />
        <Text className="text-rotulo text-tinta-fraco">{anuncio.rodape}</Text>
      </View>
    </Pressable>
  );
}
