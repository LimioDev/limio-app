import { useRouter } from "expo-router";
import { useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { useEncerrarContaMutation } from "../servico/conta.queries";

const MENSAGEM_CONTA_ENCERRADA = "Sua conta foi encerrada.";

export function useEncerrarContaViewModel() {
  const router = useRouter();
  const sair = useSessao((estado) => estado.sair);
  const expirar = useSessao((estado) => estado.expirar);
  const mutation = useEncerrarContaMutation();
  const [confirmado, setConfirmado] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const aoEncerrar = async () => {
    if (!confirmado || mutation.isPending) {
      return;
    }
    setErroServidor(null);
    try {
      await mutation.mutateAsync();
    } catch (erro) {
      setErroServidor(
        mensagemErroApi(
          erro,
          "Não foi possível encerrar sua conta. Verifique sua conexão e tente novamente.",
        ),
      );
      return;
    }

    // A conta já foi encerrada no servidor e as sessões revogadas. Fim da
    // sessão tira o acesso a `(app)` e o guard leva à tela 01 Boas-vindas.
    try {
      await sair();
    } catch {
      // SecureStore falhou: derruba a sessão do mesmo jeito.
      await expirar(MENSAGEM_CONTA_ENCERRADA);
    }
  };

  return {
    confirmado,
    aoAlternarConfirmacao: () => setConfirmado((atual) => !atual),
    podeEncerrar: confirmado && !mutation.isPending,
    encerrando: mutation.isPending,
    aoEncerrar,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
