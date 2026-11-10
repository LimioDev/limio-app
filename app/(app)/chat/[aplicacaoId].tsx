import { useLocalSearchParams } from "expo-router";

import { ChatView } from "../../../src/modulos/chat/view/ChatView";
import { useChatViewModel } from "../../../src/modulos/chat/viewmodel/useChatViewModel";

/** Chat 1:1 da candidatura (telas 21 e 22). `aplicacaoId` é o id da candidatura. */
export default function Chat() {
  const { aplicacaoId } = useLocalSearchParams<{ aplicacaoId: string }>();
  const vm = useChatViewModel(aplicacaoId);
  return <ChatView {...vm} />;
}
