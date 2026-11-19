import { PapelUsuario } from "../../../src/comum/tipos/papel";
import { ConversasView } from "../../../src/modulos/chat/view/ConversasView";
import { useConversasViewModel } from "../../../src/modulos/chat/viewmodel/useConversasViewModel";

/** Tela 42 "Conversas" do Empregador (ETI-104). */
export default function Chats() {
  const vm = useConversasViewModel(PapelUsuario.EMPREGADOR);
  return <ConversasView {...vm} />;
}
