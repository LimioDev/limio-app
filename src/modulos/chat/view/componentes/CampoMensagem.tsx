import { ArrowRight, Camera, Lock } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CORES_ICONE, Icone } from "../../../../comum/componentes/ui/Icone";

interface CampoMensagemProps {
  texto: string;
  textoMax: number;
  aoMudarTexto: (texto: string) => void;
  podeEnviar: boolean;
  aoEnviar: () => void;
  aoCamera: () => void;
}

/** Rodapé da tela 21: "Escreva uma mensagem", câmera e enviar (desabilitado sem texto). */
export function CampoMensagem({
  texto,
  textoMax,
  aoMudarTexto,
  podeEnviar,
  aoEnviar,
  aoCamera,
}: CampoMensagemProps) {
  return (
    <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
      <View className="flex-row items-end gap-3 px-margem py-3">
        <View className="min-h-botao flex-1 flex-row items-center rounded-full border border-borda-campo bg-fundo pl-4 pr-2">
          <TextInput
            value={texto}
            onChangeText={aoMudarTexto}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={CORES_ICONE.fraco}
            maxLength={textoMax}
            multiline
            accessibilityLabel="Mensagem"
            className="max-h-[120px] flex-1 py-3 text-corpo text-tinta"
          />
          <Pressable
            onPress={aoCamera}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Enviar foto"
            className="h-toque w-10 items-center justify-center"
          >
            <Icone icone={Camera} tamanho={20} cor="fraco" />
          </Pressable>
        </View>
        <Pressable
          onPress={aoEnviar}
          disabled={!podeEnviar}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: !podeEnviar }}
          className={`h-botao w-12 items-center justify-center rounded-full bg-marca-500 active:opacity-80 ${podeEnviar ? "" : "opacity-50"}`}
        >
          <Icone icone={ArrowRight} tamanho={22} cor="branco" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

interface RodapeSomenteLeituraProps {
  rotuloLink: string;
  aoLink: () => void;
}

/** Rodapé da tela 22: campo desabilitado e o link de volta. */
export function RodapeSomenteLeitura({ rotuloLink, aoLink }: RodapeSomenteLeituraProps) {
  return (
    <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
      <View className="gap-3 px-margem pb-2 pt-3">
        <View
          className="h-botao flex-row items-center gap-3 rounded-campo bg-fundo px-4"
          accessibilityState={{ disabled: true }}
        >
          <Icone icone={Lock} tamanho={16} cor="fraco" />
          <Text className="text-corpo text-tinta-fraco">Você não pode enviar mensagens aqui</Text>
        </View>
        <Text
          onPress={aoLink}
          accessibilityRole="link"
          className="self-center py-1 text-corpo font-bold text-marca-500"
        >
          {rotuloLink}
        </Text>
      </View>
    </SafeAreaView>
  );
}
