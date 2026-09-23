import { useRouter } from "expo-router";
import { useState } from "react";

import { rotuloPapel } from "../tipos/auth.enums";
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
      router.replace("/(app)/(contratante)");
    },
    aoVoltar: () => router.back(),
  };
}
