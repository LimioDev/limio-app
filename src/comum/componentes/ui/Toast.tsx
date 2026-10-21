import { Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleCheck } from "lucide-react-native";

import { useToast } from "../../store/toast";
import { Icone } from "./Icone";

/** Montado uma vez no layout raiz; mostra o que `useToast().mostrar` publicar. */
export function Toast() {
  const mensagem = useToast((estado) => estado.mensagem);
  const esconder = useToast((estado) => estado.esconder);
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
        className="flex-row items-center gap-3 rounded-card bg-marca-800 px-4 py-3"
      >
        <Icone icone={CircleCheck} cor="branco" />
        <Text className="flex-1 text-corpo font-semibold text-white">
          {mensagem}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
