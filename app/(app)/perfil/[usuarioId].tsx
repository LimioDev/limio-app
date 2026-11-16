import { useLocalSearchParams } from "expo-router";

import { usePerfilPublicoViewModel } from "../../../src/modulos/perfil/viewmodel/usePerfilPublicoViewModel";
import { PerfilPublicoView } from "../../../src/modulos/perfil/view/PerfilPublicoView";

export default function PerfilPublico() {
  const { usuarioId, papel, candidaturaId, anuncioId } = useLocalSearchParams<{
    usuarioId: string;
    papel?: string;
    candidaturaId?: string;
    anuncioId?: string;
  }>();
  const vm = usePerfilPublicoViewModel({ usuarioId, papel, candidaturaId, anuncioId });
  return <PerfilPublicoView {...vm} />;
}
