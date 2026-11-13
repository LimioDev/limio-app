import { useRouter } from "expo-router";
import { useRef, useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useToast, TipoToast } from "../../../comum/store/toast";
import { rotuloPapel } from "../../../comum/tipos/papel";
import { useReenviarConfirmacaoEmailMutation } from "../servico/auth.queries";
import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";

export function useConfirmarEmailViewModel() {
  const router = useRouter();
  const email = useCadastroEmAndamento((estado) => estado.email);
  const papelAtivo = useCadastroEmAndamento((estado) => estado.papelAtivo);
  const limpar = useCadastroEmAndamento((estado) => estado.limpar);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const reenviar = useReenviarConfirmacaoEmailMutation();
  // Trava desde o toque: o estado do React só muda no próximo render, e o
  // clique duplo passava antes do `reenviando` (derivado de `isPending`) virar true.
  const enviando = useRef(false);

  const [linkReenviado, setLinkReenviado] = useState(false);

  return {
    email,
    rotuloPapelAtivo: papelAtivo ? rotuloPapel(papelAtivo) : "Empregador",
    linkReenviado,
    reenviando: reenviar.isPending,
    aoReenviarLink: () => {
      if (!email || enviando.current) {
        return;
      }
      enviando.current = true;
      // O backend responde 200 sempre que recebe o pedido (anti-enumeração e
      // limite de pedidos excedido incluídos) — só uma falha de rede/5xx cai
      // no erro, caso em que não faz sentido dizer que o link foi reenviado.
      reenviar.mutate(email, {
        onSuccess: () => setLinkReenviado(true),
        onError: (erro) => mostrarToast(mensagemErroApi(erro, "Não foi possível reenviar o link. Tente novamente."), TipoToast.ERRO),
        onSettled: () => {
          enviando.current = false;
        },
      });
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
