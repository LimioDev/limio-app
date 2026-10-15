import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { erroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { useAlterarSenhaMutation } from "../servico/auth.queries";
import {
  AlterarSenhaFormSchema,
  SENHA_TAMANHO_MINIMO,
  TEM_LETRA,
  TEM_NUMERO,
  type AlterarSenhaForm,
} from "../tipos/auth.types";

export function useAlterarSenhaViewModel() {
  const router = useRouter();
  const entrar = useSessao((estado) => estado.entrar);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const mutation = useAlterarSenhaMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<AlterarSenhaForm>({
    resolver: zodResolver(AlterarSenhaFormSchema),
    mode: "onTouched",
    defaultValues: { senhaAtual: "", novaSenha: "", repetirNovaSenha: "" },
  });

  const novaSenha = useWatch({ control: form.control, name: "novaSenha" });

  // Mudar a nova senha reavalia "Repetir a nova senha" — só se o usuário já
  // passou por ele, pra não acusar divergência num campo ainda vazio.
  const { trigger, getFieldState } = form;
  useEffect(() => {
    if (getFieldState("repetirNovaSenha").isTouched) {
      void trigger("repetirNovaSenha");
    }
  }, [novaSenha, trigger, getFieldState]);

  const aoSalvar = form.handleSubmit(async ({ senhaAtual, novaSenha }) => {
    setErroServidor(null);
    try {
      const tokens = await mutation.mutateAsync({ senhaAtual, novaSenha });
      // A sessão deste aparelho segue com os tokens novos; os antigos já não valem.
      await entrar(tokens);
      mostrarToast("Senha alterada com sucesso");
      router.back();
    } catch (erro) {
      switch (erroApi(erro)?.codigo) {
        case CodigoErro.SENHA_ATUAL_INCORRETA:
          form.setError("senhaAtual", { message: "Senha atual incorreta" });
          return;
        case CodigoErro.SENHA_IGUAL_ANTERIOR:
          form.setError("novaSenha", {
            message: "A nova senha deve ser diferente da atual",
          });
          return;
        default:
          setErroServidor(
            "Não foi possível alterar a senha. Verifique sua conexão e tente novamente.",
          );
      }
    }
  });

  return {
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
    aoVoltar: () => router.back(),
  };
}
