import { useMunicipioBaseViewModel } from "../../../src/modulos/perfil/viewmodel/useMunicipioBaseViewModel";
import { SeletorMunicipioView } from "../../../src/modulos/perfil/view/SeletorMunicipioView";

export default function MunicipioBase() {
  const vm = useMunicipioBaseViewModel();
  return <SeletorMunicipioView {...vm} />;
}
