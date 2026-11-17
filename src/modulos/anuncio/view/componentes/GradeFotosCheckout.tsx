import { Image } from "expo-image";
import { Camera, Check, CircleAlert } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { CORES_ICONE, Icone } from "../../../../comum/componentes/ui/Icone";
import type { FotoExibida } from "../../viewmodel/useEscolhaDeFotos";

interface GradeFotosCheckoutProps {
  fotos: FotoExibida[];
  /** Tocar na miniatura abre a folha "Remover foto?". */
  aoTocarFoto: (chave: string) => void;
  aoAdicionar: () => void;
  podeAdicionar: boolean;
  adicionando: boolean;
  /** Erro das fotos vindo da API (`FOTO_*`): borda de erro em todas. */
  comErro: boolean;
}

/** Duas colunas, como no protótipo da tela 38. */
const TAMANHO_BLOCO = { width: "48.5%", aspectRatio: 1.18 } as const;

/** Grade da tela 38: fotos com a marca de selecionada e o bloco "Adicionar foto". */
export function GradeFotosCheckout({
  fotos,
  aoTocarFoto,
  aoAdicionar,
  podeAdicionar,
  adicionando,
  comErro,
}: GradeFotosCheckoutProps) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {fotos.map((foto, indice) => {
        const recusada = foto.erro !== null;
        return (
          <Pressable
            key={foto.chave}
            onPress={() => aoTocarFoto(foto.chave)}
            accessibilityRole="button"
            accessibilityLabel={`Foto ${indice + 1}${recusada ? ", recusada" : ", selecionada"}. Toque para remover`}
            style={TAMANHO_BLOCO}
            className={`overflow-hidden rounded-card bg-marca-50 active:opacity-80 ${
              recusada || comErro ? "border-[1.5px] border-perigo" : "border border-marca-100"
            }`}
          >
            <Image
              source={{ uri: foto.uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            {recusada ? (
              <View className="absolute inset-0 items-center justify-center bg-perigo-fundo/80">
                <Icone icone={CircleAlert} tamanho={24} cor="perigo" />
              </View>
            ) : (
              <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-marca-500">
                <Icone icone={Check} tamanho={14} cor="branco" />
              </View>
            )}
          </Pressable>
        );
      })}

      {podeAdicionar || adicionando ? (
        <Pressable
          onPress={aoAdicionar}
          disabled={adicionando || !podeAdicionar}
          accessibilityRole="button"
          accessibilityLabel="Adicionar foto"
          style={TAMANHO_BLOCO}
          className="items-center justify-center gap-2 rounded-card border border-borda-campo bg-superficie active:opacity-70"
        >
          {adicionando ? (
            <ActivityIndicator color={CORES_ICONE.marca} />
          ) : (
            <>
              <Icone icone={Camera} tamanho={24} cor="marca" />
              <Text className="text-rotulo font-bold text-marca-500">Adicionar foto</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
