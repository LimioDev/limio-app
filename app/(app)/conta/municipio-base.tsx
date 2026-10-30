import { useMunicipioBaseViewModel } from "../../../src/modulos/perfil/viewmodel/useMunicipioBaseViewModel";
import { SeletorMunicipioView } from "../../../src/comum/componentes/localidade/SeletorMunicipioView";

export default function MunicipioBase() {
  const vm = useMunicipioBaseViewModel();
  return <SeletorMunicipioView {...vm} />;
}
