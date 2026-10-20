import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useRecuperarSenhaMutation } from "../servico/auth.queries";
import {
  ESPERA_REENVIO_S,
  useReenvioRecuperacao,
} from "../store/reenvioRecuperacao.store";
import {
  RecuperarSenhaFormSchema,
  type RecuperarSenhaForm,
} from "../tipos/auth.types";

// Sempre a mesma, exista a conta ou não: o backend também não diz (anti-enumeração).
const MENSAGEM_LINK_ENVIADO =
  "Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha. Confira sua caixa de entrada.";

export function useRecuperarSenhaViewModel() {
  const router = useRouter();
  const mutation = useRecuperarSenhaMutation();
  const [confirmacao, setConfirmacao] = useState<string | null>(null);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<RecuperarSenhaForm>({
    resolver: zodResolver(RecuperarSenhaFormSchema),
    defaultValues: { email: "" },
  });

  const proximoEnvioPermitidoEm = useReenvioRecuperacao(
    (estado) => estado.proximoEnvioPermitidoEm,
  );
  const registrarEnvio = useReenvioRecuperacao(
    (estado) => estado.registrarEnvio,
  );
  const [agora, setAgora] = useState(() => Date.now());
  // `agora` só anda no efeito abaixo; logo depois de um envio ele está
  // atrasado, por isso o teto de 60 s até o próximo tique.
  const segundosParaReenviar =
    proximoEnvioPermitidoEm === null
      ? 0
      : Math.min(
          ESPERA_REENVIO_S,
          Math.max(0, Math.ceil((proximoEnvioPermitidoEm - agora) / 1000)),
        );

  // Relógio da contagem: só anda enquanto há espera.
  useEffect(() => {
    if (segundosParaReenviar <= 0) {
      return;
    }
    const temporizador = setTimeout(() => setAgora(Date.now()), 1000);
    return () => clearTimeout(temporizador);
  }, [segundosParaReenviar, agora]);

  const enviarLink = form.handleSubmit(async ({ email }) => {
    setErroServidor(null);
    setConfirmacao(null);
    try {
      await mutation.mutateAsync(email);
      setConfirmacao(MENSAGEM_LINK_ENVIADO);
      // Segura o botão pra não gastar os poucos pedidos por hora do backend.
      registrarEnvio();
    } catch {
      // Sem código de negócio a tratar: a API só recusa formato, que o form já barra.
      setErroServidor(
        "Não foi possível enviar o link. Verifique sua conexão e tente novamente.",
      );
    }
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    // O "Enviar" do teclado também chega aqui, não só o botão desabilitado.
    aoEnviarLink: () => {
      if (segundosParaReenviar === 0) {
        void enviarLink();
      }
    },
    carregando: mutation.isPending,
    segundosParaReenviar,
    confirmacao,
    erroServidor,
    // A tela só é aberta a partir do login, então voltar é voltar pro login.
    aoVoltarParaLogin: () =>
      router.canGoBack() ? router.back() : router.replace("/(auth)/login"),
  };
}
