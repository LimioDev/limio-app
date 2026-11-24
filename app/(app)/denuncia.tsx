import { useLocalSearchParams } from "expo-router";

import {
  useDenunciaViewModel,
  type ParametrosDenuncia,
} from "../../src/modulos/moderacao/viewmodel/useDenunciaViewModel";
import { DenunciaView } from "../../src/modulos/moderacao/view/DenunciaView";

/** Tela 46 "Abrir denúncia" (ETI-115); o alvo e o card vêm da tela anterior. */
export default function Denuncia() {
  const params = useLocalSearchParams<ParametrosDenuncia>();
  const vm = useDenunciaViewModel(params);
  return <DenunciaView {...vm} />;
}
