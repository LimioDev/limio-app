import { useRouter } from "expo-router";
import { useState } from "react";

import { rotuloPapel } from "../../../comum/tipos/papel";
import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";

export function useConfirmarEmailViewModel() {
  const router = useRouter();
  const email = useCadastroEmAndamento((estado) => estado.email);
  const papelAtivo = useCadastroEmAndamento((estado) => estado.papelAtivo);
  const limpar = useCadastroEmAndamento((estado) => estado.limpar);

  const [linkReenviado, setLinkReenviado] = useState(false);

  return {
    email,
    rotuloPapelAtivo: papelAtivo ? rotuloPapel(papelAtivo) : "Empregador",
    linkReenviado,
    aoReenviarLink: () => setLinkReenviado(true),
    aoUsarOutroEmail: () => router.replace("/(auth)/cadastro"),
    aoIrParaApp: () => {
      limpar();
      // O cadastro não abre sessão: a conta já existe, mas é preciso entrar.
      router.replace("/(auth)/login");
    },
    aoVoltar: () => router.back(),
  };
}
