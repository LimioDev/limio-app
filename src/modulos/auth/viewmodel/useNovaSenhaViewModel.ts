import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { erroApi } from "../../../comum/lib/erros";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { useRedefinirSenhaMutation } from "../servico/auth.queries";
import {
  NovaSenhaFormSchema,
  SENHA_TAMANHO_MINIMO,
  TEM_LETRA,
  TEM_NUMERO,
  type NovaSenhaForm,
} from "../tipos/auth.types";

/**
 * Tela aberta pelo link do e-mail de recuperação (`limio://nova-senha?token=...`).
 * Sem token, ou com token vencido/já usado, só resta pedir um link novo.
 */
export function useNovaSenhaViewModel() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const mostrarToast = useToast((estado) => estado.mostrar);
  const mutation = useRedefinirSenhaMutation();
  const [linkInvalido, setLinkInvalido] = useState(!token);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<NovaSenhaForm>({
    resolver: zodResolver(NovaSenhaFormSchema),
    mode: "onTouched",
    defaultValues: { novaSenha: "", repetirNovaSenha: "" },
  });

  const novaSenha = useWatch({ control: form.control, name: "novaSenha" });

  // Mesmo comportamento de "Alterar senha": só reavalia a repetição depois
  // que o usuário passou por ela.
  const { trigger, getFieldState } = form;
  useEffect(() => {
    if (getFieldState("repetirNovaSenha").isTouched) {
      void trigger("repetirNovaSenha");
    }
  }, [novaSenha, trigger, getFieldState]);

  const aoSalvar = form.handleSubmit(async ({ novaSenha }) => {
    if (!token) {
      setLinkInvalido(true);
      return;
    }
    setErroServidor(null);
    try {
      await mutation.mutateAsync({ token, novaSenha });
      // O backend encerra todas as sessões da conta: entra de novo com a senha nova.
      mostrarToast("Senha redefinida. Entre com a nova senha.");
      router.replace("/(auth)/login");
    } catch (erro) {
      switch (erroApi(erro)?.codigo) {
        case CodigoErro.TOKEN_RECUPERACAO_INVALIDO:
          setLinkInvalido(true);
          return;
        case CodigoErro.SENHA_IGUAL_ANTERIOR:
          form.setError("novaSenha", {
            message: "A nova senha deve ser diferente da anterior",
          });
          return;
        default:
          setErroServidor(
            "Não foi possível redefinir a senha. Verifique sua conexão e tente novamente.",
          );
      }
    }
  });

  return {
    linkInvalido,
    control: form.control,
    erros: form.formState.errors,
    requisitos: {
      tamanho: novaSenha.length >= SENHA_TAMANHO_MINIMO,
      letra: TEM_LETRA.test(novaSenha),
      numero: TEM_NUMERO.test(novaSenha),
    },
    podeSalvar: form.formState.isValid && !mutation.isPending,
    salvando: mutation.isPending,
    aoSalvar,
    erroServidor,
    aoPedirNovoLink: () => router.replace("/(auth)/recuperar-senha"),
    aoVoltarParaLogin: () => router.replace("/(auth)/login"),
  };
}
