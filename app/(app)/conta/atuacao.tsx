import { PapelUsuario } from "../../../src/comum/tipos/papel";
import { useTrocarPapelViewModel } from "../../../src/modulos/auth/viewmodel/useTrocarPapelViewModel";
import { usePerfilAtuacaoViewModel } from "../../../src/modulos/perfil/viewmodel/usePerfilAtuacaoViewModel";
import { PerfilAtuacaoView } from "../../../src/modulos/perfil/view/PerfilAtuacaoView";

export default function Atuacao() {
  // Aberta pelo seletor de papel, a tela conclui a troca pra Prestador ao
  // salvar. A troca é do módulo `auth`; a rota junta os dois.
  const troca = useTrocarPapelViewModel();
  const vm = usePerfilAtuacaoViewModel({
    aoConcluirTrocaDePapel: () => troca.aoEscolher(PapelUsuario.PRESTADOR),
    erroTrocaDePapel: troca.erroServidor,
    trocandoPapel: Boolean(troca.papelEmTroca),
  });
  return <PerfilAtuacaoView {...vm} />;
}
