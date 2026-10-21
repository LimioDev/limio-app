import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { erroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import type { TokensSessao } from "../../../comum/tipos/sessao";
import {
  useAlterarSenhaMutation,
  useRevogarSessaoNaoSalvaMutation,
} from "../servico/auth.queries";
import {
  AlterarSenhaFormSchema,
  SENHA_TAMANHO_MINIMO,
  TEM_LETRA,
  TEM_NUMERO,
  type AlterarSenhaForm,
} from "../tipos/auth.types";

const MENSAGEM_SENHA_ALTERADA_ENTRAR = "Senha alterada. Entre novamente.";

export function useAlterarSenhaViewModel() {
  const router = useRouter();
  const entrar = useSessao((estado) => estado.entrar);
  const expirar = useSessao((estado) => estado.expirar);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const mutation = useAlterarSenhaMutation();
  const revogarSessao = useRevogarSessaoNaoSalvaMutation();
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
    let tokens: TokensSessao;
    try {
      tokens = await mutation.mutateAsync({ senhaAtual, novaSenha });
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
        // Sessão revogada em outro aparelho ou sem renovação possível: volta
        // pro login com o aviso de sessão expirada.
        case CodigoErro.NAO_AUTENTICADO:
        case CodigoErro.SESSAO_INVALIDA:
          await expirar();
          return;
        default:
          setErroServidor(
            "Não foi possível alterar a senha. Verifique sua conexão e tente novamente.",
          );
      }
      return;
    }

    // Daqui pra baixo a senha já mudou no servidor e as outras sessões caíram:
    // falha nunca pode virar "não foi possível alterar" (tentar de novo daria
    // SENHA_ATUAL_INCORRETA, porque a atual agora é a nova).
    try {
      // A sessão deste aparelho segue com os tokens novos; os antigos já não valem.
      await entrar(tokens);
    } catch {
      // `entrar` recusou o papel ou o SecureStore falhou: revoga a sessão
      // nova que não foi guardada e leva ao login.
      await revogarSessao.mutateAsync(tokens);
      await expirar(MENSAGEM_SENHA_ALTERADA_ENTRAR);
      return;
    }
    mostrarToast("Senha alterada com sucesso");
    router.back();
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
