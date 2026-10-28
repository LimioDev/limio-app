import { SeletorMunicipioView } from "../../../../src/comum/componentes/localidade/SeletorMunicipioView";
import { useCidadeAvulsoViewModel } from "../../../../src/modulos/anuncio/viewmodel/useCidadeAvulsoViewModel";

export default function CidadeEnderecoAvulso() {
  const vm = useCidadeAvulsoViewModel();
  return <SeletorMunicipioView {...vm} />;
}
