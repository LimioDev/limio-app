import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useBuscaCep } from "../../../comum/hooks/useBuscaCep";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { somenteDigitos } from "../../../comum/lib/telefone";
import { rotuloMunicipio } from "../../../comum/tipos/localidade";
import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";
import { dataBrParaIso } from "../servico/auth.helpers";
import { useCadastrarUsuarioMutation } from "../servico/auth.queries";
import {
  DadosPessoaisFormSchema,
  type DadosPessoaisForm,
  type DadosPessoaisFormEntrada,
} from "../tipos/auth.types";

export function useCadastroDadosViewModel() {
  const router = useRouter();
  const iniciar = useCadastroEmAndamento((estado) => estado.iniciar);
  const mutation = useCadastrarUsuarioMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<DadosPessoaisFormEntrada, unknown, DadosPessoaisForm>({
    resolver: zodResolver(DadosPessoaisFormSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      nascimento: "",
      cep: "",
      cidadeUf: "",
      email: "",
      celular: "",
      senha: "",
    },
  });

  const cep = useWatch({ control: form.control, name: "cep" });
  const { carregando: buscandoCep, erro: erroCep } = useBuscaCep(cep ?? "", (endereco) => {
    form.setValue("cidadeUf", rotuloMunicipio(endereco.cidade, endereco.uf), {
      shouldDirty: true,
      shouldValidate: true,
    });
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
      router.push("/(auth)/confirmar-email");
    } catch (erro) {
      setErroServidor(
        mensagemErroApi(erro, "Não foi possível concluir o cadastro."),
      );
    }
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    buscandoCep,
    erroCep,
    aoContinuar,
    carregando: mutation.isPending,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
