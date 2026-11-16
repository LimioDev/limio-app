import { useLocalSearchParams } from "expo-router";

import { ChatView } from "../../../src/modulos/chat/view/ChatView";
import { useChatViewModel } from "../../../src/modulos/chat/viewmodel/useChatViewModel";

/**
 * Chat 1:1 da candidatura (telas 21 e 22). `aplicacaoId` é o id da
 * candidatura; `anuncioId` vem quando o Empregador abre pela tela 18 e liga o
 * "Escolher" (tela 23).
 */
export default function Chat() {
  const { aplicacaoId, anuncioId } = useLocalSearchParams<{
    aplicacaoId: string;
    anuncioId?: string;
  }>();
  const vm = useChatViewModel(aplicacaoId, anuncioId);
  return <ChatView {...vm} />;
}
