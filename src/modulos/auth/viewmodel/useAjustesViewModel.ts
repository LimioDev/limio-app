import { useRouter } from "expo-router";

import { useSessao } from "../../../comum/store/sessao";
import { rotuloPapel } from "../../../comum/tipos/papel";
import { useLogoutMutation } from "../servico/auth.queries";

export function useAjustesViewModel() {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const sair = useSessao((estado) => estado.sair);
  const mutation = useLogoutMutation();

  const aoSair = async () => {
    try {
      await mutation.mutateAsync();
    } catch {
      // Sem rede ou sessão já revogada: sai do aparelho do mesmo jeito.
    } finally {
      // Fim da sessão tira o acesso a `(app)` e o guard leva à tela 01 Boas-vindas.
      await sair();
    }
  };

  return {
    rotuloPapelAtivo: papelAtivo ? rotuloPapel(papelAtivo) : null,
    aoAlternarPapel: () => router.push("/(app)/trocar-papel"),
    aoSair,
    saindo: mutation.isPending,
    aoVoltar: () => router.back(),
  };
}
