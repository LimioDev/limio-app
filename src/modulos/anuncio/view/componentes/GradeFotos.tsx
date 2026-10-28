import { Image } from "expo-image";
import { Camera, CircleAlert, X } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { CORES_ICONE, Icone } from "../../../../comum/componentes/ui/Icone";

export interface FotoDaGrade {
  chave: string;
  uri: string;
  erro?: string | null;
}

interface GradeFotosProps {
  fotos: FotoDaGrade[];
  /** Com `aoRemover`, cada miniatura ganha o "x". */
  aoRemover?: (chave: string) => void;
  /** Com `aoAdicionar`, a grade termina no botão "Adicionar". */
  aoAdicionar?: () => void;
  podeAdicionar?: boolean;
  adicionando?: boolean;
}

const LADO = 96;

/** Miniaturas das fotos do anúncio (telas 14 e 16). A foto recusada fica com borda e ícone de alerta. */
export function GradeFotos({
  fotos,
  aoRemover,
  aoAdicionar,
  podeAdicionar = true,
  adicionando = false,
}: GradeFotosProps) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {fotos.map((foto, indice) => (
        <View
          key={foto.chave}
          style={{ width: LADO, height: LADO }}
          className={`overflow-hidden rounded-campo bg-marca-50 ${foto.erro ? "border-[1.5px] border-perigo" : "border border-marca-100"}`}
        >
          <Image
            source={{ uri: foto.uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            accessibilityLabel={`Foto ${indice + 1}`}
          />
          {foto.erro ? (
            <View className="absolute inset-0 items-center justify-center bg-perigo-fundo/80">
              <Icone icone={CircleAlert} tamanho={22} cor="perigo" />
            </View>
          ) : null}
          {aoRemover ? (
            <Pressable
              onPress={() => aoRemover(foto.chave)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remover foto ${indice + 1}`}
              className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-marca-900/70"
            >
              <Icone icone={X} tamanho={14} cor="branco" />
            </Pressable>
          ) : null}
        </View>
      ))}

      {aoAdicionar && podeAdicionar ? (
        <Pressable
          onPress={aoAdicionar}
          disabled={adicionando}
          accessibilityRole="button"
          accessibilityLabel="Adicionar fotos"
          style={{ width: LADO, height: LADO }}
          className="items-center justify-center gap-1.5 rounded-campo border border-borda-campo bg-superficie active:opacity-70"
        >
          {adicionando ? (
            <ActivityIndicator color={CORES_ICONE.marca} />
          ) : (
            <>
              <Icone icone={Camera} tamanho={22} cor="marca" />
              <Text className="text-rotulo font-bold text-marca-500">Adicionar</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
