import { MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { EnderecoExibido } from "../../viewmodel/useEnderecosSalvosViewModel";

interface CartaoEnderecoProps {
  endereco: EnderecoExibido;
  /** Alguma ação deste endereço em andamento: trava os botões. */
  ocupado: boolean;
  aoEditar: () => void;
  aoTornarPadrao: () => void;
  aoRemover: () => void;
}

function Acao({
  rotulo,
  onPress,
  desabilitado,
  perigo = false,
}: {
  rotulo: string;
  onPress: () => void;
  desabilitado: boolean;
  perigo?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      className="py-1 active:opacity-60"
    >
      <Text className={`text-[13px] font-bold ${perigo ? "text-perigo" : "text-marca-500"}`}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

/** Cartão da tela 09: apelido, selo "PADRÃO", endereço e as ações. */
export function CartaoEndereco({
  endereco,
  ocupado,
  aoEditar,
  aoTornarPadrao,
  aoRemover,
}: CartaoEnderecoProps) {
  return (
    <View
      className={`rounded-card border bg-superficie px-4 ${endereco.isPadrao ? "border-marca-100" : "border-borda"} ${ocupado ? "opacity-60" : ""}`}
    >
      <View className="flex-row gap-3 pb-3 pt-4">
        <View className="pt-0.5">
          <Icone icone={MapPin} tamanho={18} cor="marca-escura" />
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-[15.5px] font-bold text-tinta" numberOfLines={1}>
              {endereco.apelido}
            </Text>
            {endereco.isPadrao ? (
              <View className="rounded-full bg-marca-50 px-2.5 py-1">
                <Text className="text-overline font-bold uppercase text-marca-600">
                  Padrão
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[13px] text-tinta-suave">{endereco.logradouro}</Text>
          <Text className="text-[12px] text-tinta-fraco">{endereco.local}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-6 border-t border-borda py-2.5">
        <Acao rotulo="Editar" onPress={aoEditar} desabilitado={ocupado} />
        {endereco.isPadrao ? null : (
          <Acao rotulo="Tornar padrão" onPress={aoTornarPadrao} desabilitado={ocupado} />
        )}
        <View className="flex-1 items-end">
          <Acao rotulo="Remover" onPress={aoRemover} desabilitado={ocupado} perigo />
        </View>
      </View>
    </View>
  );
}
