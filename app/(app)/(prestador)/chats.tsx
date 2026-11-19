import { PapelUsuario } from "../../../src/comum/tipos/papel";
import { ConversasView } from "../../../src/modulos/chat/view/ConversasView";
import { useConversasViewModel } from "../../../src/modulos/chat/viewmodel/useConversasViewModel";

/** Tela 42b "Conversas" do Prestador (ETI-104). */
export default function Chats() {
  const vm = useConversasViewModel(PapelUsuario.PRESTADOR);
  return <ConversasView {...vm} />;
}
