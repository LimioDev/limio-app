import { useMunicipioBaseViewModel } from "../../../src/modulos/perfil/viewmodel/useMunicipioBaseViewModel";
import { MunicipioBaseView } from "../../../src/modulos/perfil/view/MunicipioBaseView";

export default function MunicipioBase() {
  const vm = useMunicipioBaseViewModel();
  return <MunicipioBaseView {...vm} />;
}
