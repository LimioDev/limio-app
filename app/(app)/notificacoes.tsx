import { useNotificacoesViewModel } from "../../src/modulos/notificacao/viewmodel/useNotificacoesViewModel";
import { NotificacoesView } from "../../src/modulos/notificacao/view/NotificacoesView";

/** Tela 43 "Notificações" (ETI-111): vale pros dois papéis. */
export default function Notificacoes() {
  const vm = useNotificacoesViewModel();
  return <NotificacoesView {...vm} />;
}
