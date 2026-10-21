import { Pressable, Text } from "react-native";

interface BotaoMostrarSenhaProps {
  visivel: boolean;
  aoAlternar: () => void;
}

/**
 * "Mostrar"/"Ocultar" à direita de um campo de senha (`acaoDireita` do `Campo`).
 * Em `comum/` porque `auth` (login, cadastro, senhas) e `perfil` (Dados de contato) usam.
 */
export function BotaoMostrarSenha({ visivel, aoAlternar }: BotaoMostrarSenhaProps) {
  return (
    <Pressable
      onPress={aoAlternar}
      // O texto é estreito: o hitSlop completa a área mínima de toque sem
      // mudar o visual.
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={visivel ? "Ocultar senha" : "Mostrar senha"}
      className="h-toque justify-center"
    >
      <Text className="text-rotulo font-semibold text-marca-500">
        {visivel ? "Ocultar" : "Mostrar"}
      </Text>
    </Pressable>
  );
}
