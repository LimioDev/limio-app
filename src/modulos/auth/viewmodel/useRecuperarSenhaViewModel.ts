import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useRecuperarSenhaMutation } from "../servico/auth.queries";
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

  const aoEnviarLink = form.handleSubmit(async ({ email }) => {
    setErroServidor(null);
    setConfirmacao(null);
    try {
      await mutation.mutateAsync(email);
      setConfirmacao(MENSAGEM_LINK_ENVIADO);
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
    aoEnviarLink,
    carregando: mutation.isPending,
    confirmacao,
    erroServidor,
    // A tela só é aberta a partir do login, então voltar é voltar pro login.
    aoVoltarParaLogin: () =>
      router.canGoBack() ? router.back() : router.replace("/(auth)/login"),
  };
}
