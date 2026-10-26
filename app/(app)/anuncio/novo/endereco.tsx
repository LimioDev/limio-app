import { useEnderecoAvulsoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useEnderecoAvulsoViewModel";
import { EnderecoAvulsoView } from "../../../../src/modulos/anuncio/view/EnderecoAvulsoView";

/** "+ Usar outro endereço" da tela 15. */
export default function EnderecoAvulso() {
  const vm = useEnderecoAvulsoViewModel();
  return <EnderecoAvulsoView {...vm} />;
}
