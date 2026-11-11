import { useRouter } from "expo-router";
import { useState } from "react";

import { rotuloPapel } from "../../../comum/tipos/papel";
import { useReenviarConfirmacaoEmailMutation } from "../servico/auth.queries";
import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";

export function useConfirmarEmailViewModel() {
  const router = useRouter();
  const email = useCadastroEmAndamento((estado) => estado.email);
  const papelAtivo = useCadastroEmAndamento((estado) => estado.papelAtivo);
  const limpar = useCadastroEmAndamento((estado) => estado.limpar);
  const reenviar = useReenviarConfirmacaoEmailMutation();

  const [linkReenviado, setLinkReenviado] = useState(false);

  return {
    email,
    rotuloPapelAtivo: papelAtivo ? rotuloPapel(papelAtivo) : "Empregador",
    linkReenviado,
    reenviando: reenviar.isPending,
    aoReenviarLink: () => {
      if (!email) {
        return;
      }
      // O backend responde 200 sempre (anti-enumeração e limite de pedidos
      // excedido incluídos) — a mensagem de sucesso não depende do resultado.
      reenviar.mutate(email, { onSettled: () => setLinkReenviado(true) });
    },
    aoUsarOutroEmail: () => router.replace("/(auth)/cadastro"),
    aoIrParaApp: () => {
      limpar();
      // O cadastro não abre sessão: a conta já existe, mas é preciso entrar.
      router.replace("/(auth)/login");
    },
    aoVoltar: () => router.back(),
  };
}
