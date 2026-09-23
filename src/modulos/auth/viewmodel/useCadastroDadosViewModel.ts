import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";
import { dataBrParaIso, somenteDigitos } from "../servico/auth.helpers";
import { useCadastrarUsuarioMutation } from "../servico/auth.queries";
import {
  DadosPessoaisFormSchema,
  type DadosPessoaisForm,
} from "../tipos/auth.types";

export function useCadastroDadosViewModel() {
  const router = useRouter();
  const iniciar = useCadastroEmAndamento((estado) => estado.iniciar);
  const mutation = useCadastrarUsuarioMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<DadosPessoaisForm>({
    resolver: zodResolver(DadosPessoaisFormSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      nascimento: "",
      cidadeUf: "",
      email: "",
      celular: "",
      senha: "",
    },
  });

  const aoContinuar = form.handleSubmit(async (dados) => {
    setErroServidor(null);
    try {
      const resposta = await mutation.mutateAsync({
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        telefone: somenteDigitos(dados.celular),
        senha: dados.senha,
        cpf: somenteDigitos(dados.cpf),
        dataNascimento: dataBrParaIso(dados.nascimento)!,
        cidadeUf: dados.cidadeUf,
      });

      iniciar({
        nomeCompleto: resposta.nomeCompleto,
        email: resposta.email,
        celular: dados.celular,
        papelAtivo: resposta.papelAtivo,
      });
      router.push("/(auth)/verificar-contato");
    } catch (erro) {
      setErroServidor(
        mensagemErroApi(erro, "Não foi possível concluir o cadastro."),
      );
    }
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    aoContinuar,
    carregando: mutation.isPending,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
