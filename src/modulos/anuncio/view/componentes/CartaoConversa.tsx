import { ChevronRight, MessageSquare } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

interface CartaoConversaProps {
  /** "Conversar com Rafael". */
  titulo: string;
  /** "2 mensagens novas", "Nenhuma mensagem nova" ou "Conversa em somente leitura". */
  detalhe: string;
  /** Sem função, o card aparece sem abrir o chat. */
  aoConversar?: () => void;
}

/** Atalho pro chat do par (tela 21, ETI-102) nas telas do serviço combinado (25, 36 e 37). */
export function CartaoConversa({ titulo, detalhe, aoConversar }: CartaoConversaProps) {
  return (
    <Pressable
      onPress={aoConversar}
      disabled={!aoConversar}
      accessibilityRole={aoConversar ? "button" : undefined}
      accessibilityLabel={`${titulo}, ${detalhe}`}
      className="flex-row items-center gap-3 rounded-card bg-marca-50 p-4 active:opacity-70"
    >
      <Icone icone={MessageSquare} tamanho={18} cor="marca" />
      <View className="flex-1 gap-0.5">
        <Text className="text-corpo font-bold text-marca-800">{titulo}</Text>
        <Text className="text-rotulo text-marca-600">{detalhe}</Text>
      </View>
      {aoConversar ? <Icone icone={ChevronRight} tamanho={20} cor="marca-escura" /> : null}
    </Pressable>
  );
}
