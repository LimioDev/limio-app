import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { erroApi } from "../../../comum/lib/erros";
import {
  MENSAGEM_PAPEL_SEM_ACESSO,
  useSessao,
} from "../../../comum/store/sessao";
import { CodigoErro } from "../../../comum/tipos/erros";
import { ehPapelDoApp } from "../../../comum/tipos/papel";
import {
  useLoginMutation,
  useRevogarSessaoNaoSalvaMutation,
} from "../servico/auth.queries";
import { LoginFormSchema, type LoginForm } from "../tipos/auth.types";

function mensagemErroLogin(erro: unknown): string {
  switch (erroApi(erro)?.codigo) {
    // Genérica de propósito: não aponta se o erro foi no e-mail ou na senha.
    case CodigoErro.CREDENCIAIS_INVALIDAS:
      return "E-mail ou senha incorretos.";
    case CodigoErro.LOGIN_TEMPORARIAMENTE_BLOQUEADO:
      return "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
    case CodigoErro.CONTA_SUSPENSA:
      return "Sua conta está suspensa. Fale com o suporte.";
    default:
      return "Não foi possível entrar. Verifique sua conexão e tente novamente.";
  }
}

export function useLoginViewModel() {
  const router = useRouter();
  const entrar = useSessao((estado) => estado.entrar);
  const avisoSaida = useSessao((estado) => estado.avisoSaida);
  const limparAvisoSaida = useSessao((estado) => estado.limparAvisoSaida);
  const mutation = useLoginMutation();
  const revogarSessao = useRevogarSessaoNaoSalvaMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", senha: "" },
  });

  const aoEntrar = form.handleSubmit(async (dados) => {
    setErroServidor(null);
    limparAvisoSaida();
    try {
      const tokens = await mutation.mutateAsync(dados);
      // Conta de administrador não tem dashboard no app: não abre sessão aqui
      // e revoga a que o backend acabou de criar.
      if (!ehPapelDoApp(tokens.papel)) {
        await revogarSessao.mutateAsync(tokens);
        setErroServidor(MENSAGEM_PAPEL_SEM_ACESSO);
        return;
      }
      // A sessão autenticada libera as rotas de `(app)` e o guard de papel
      // leva ao dashboard do papel devolvido pela API.
      await entrar(tokens);
    } catch (erro) {
      setErroServidor(mensagemErroLogin(erro));
    }
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    aoEntrar,
    carregando: mutation.isPending || revogarSessao.isPending,
    erroServidor,
    avisoSaida,
    aoEsquecerSenha: () => router.push("/(auth)/recuperar-senha"),
    aoCriarConta: () => router.push("/(auth)/cadastro"),
    aoVoltar: () => (router.canGoBack() ? router.back() : router.replace("/")),
  };
}
