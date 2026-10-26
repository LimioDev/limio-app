import { Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleAlert, CircleCheck } from "lucide-react-native";

import { TipoToast, useToast } from "../../store/toast";
import { Icone } from "./Icone";

/** Montado uma vez no layout raiz; mostra o que `useToast().mostrar` publicar. */
export function Toast() {
  const mensagem = useToast((estado) => estado.mensagem);
  const tipo = useToast((estado) => estado.tipo);
  const esconder = useToast((estado) => estado.esconder);
  const erro = tipo === TipoToast.ERRO;
  const { bottom } = useSafeAreaInsets();

  if (!mensagem) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      className="absolute inset-x-0 px-margem"
      // Em `style`, não como prop: a prop está descontinuada no react-native-web.
      style={{ bottom: bottom + 24, pointerEvents: "box-none" }}
    >
      <Pressable
        onPress={esconder}
        accessibilityRole="alert"
        className={`flex-row items-center gap-3 rounded-card px-4 py-3 ${erro ? "bg-perigo" : "bg-marca-800"}`}
      >
        <Icone icone={erro ? CircleAlert : CircleCheck} cor="branco" />
        <Text className="flex-1 text-corpo font-semibold text-white">
          {mensagem}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
