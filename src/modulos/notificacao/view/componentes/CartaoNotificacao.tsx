import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { NotificacaoExibida } from "../../viewmodel/useNotificacoesViewModel";
import { iconeNotificacao } from "./iconeNotificacao";

interface CartaoNotificacaoProps {
  notificacao: NotificacaoExibida;
  abrindo: boolean;
  onPress: () => void;
}

/** Item da tela 43: ícone do tipo, título, hora, texto e a bolinha de não lida. */
export function CartaoNotificacao({ notificacao, abrindo, onPress }: CartaoNotificacaoProps) {
  const { tipo, titulo, corpo, hora, naoLida } = notificacao;

  return (
    <Pressable
      onPress={onPress}
      disabled={abrindo}
      accessibilityRole="button"
      accessibilityLabel={`${naoLida ? "Não lida. " : ""}${titulo}, ${hora}. ${corpo}`}
      accessibilityState={{ busy: abrindo }}
      className={`flex-row gap-3 rounded-card border bg-superficie p-4 active:opacity-70 ${
        naoLida ? "border-marca-100" : "border-borda"
      } ${abrindo ? "opacity-60" : ""}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-campo bg-marca-50">
        <Icone
          icone={iconeNotificacao(tipo)}
          tamanho={18}
          cor={naoLida ? "marca-escura" : "suave"}
        />
        {naoLida ? (
          <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-marca-500" />
        ) : null}
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-start gap-2">
          <Text className="flex-1 text-corpo font-bold text-tinta">{titulo}</Text>
          <Text className="text-rotulo text-tinta-fraco">{hora}</Text>
        </View>
        <Text className="text-rotulo text-tinta-suave">{corpo}</Text>
      </View>
    </Pressable>
  );
}
