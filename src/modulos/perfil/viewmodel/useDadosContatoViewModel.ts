import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  formatarTelefone,
  mesmoEmail,
  somenteDigitos,
  telefoneNacional,
} from "../servico/perfil.helpers";
import {
  useEditarNomeExibicaoMutation,
  useMeuPerfilQuery,
  useTrocarEmailMutation,
  useTrocarTelefoneMutation,
} from "../servico/perfil.queries";
import {
  criarDadosContatoFormSchema,
  type ContatoAtual,
  type DadosContatoForm,
} from "../tipos/perfil.types";

type CampoContato = "nomeExibicao" | "email" | "telefone";

const SEM_CONTATO: ContatoAtual = { email: "", telefone: "" };

export function useDadosContatoViewModel() {
  const router = useRouter();
  const query = useMeuPerfilQuery();
  const perfil = query.data;
  const editarNome = useEditarNomeExibicaoMutation();
  const trocarEmail = useTrocarEmailMutation();
  const trocarTelefone = useTrocarTelefoneMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const atual = useMemo<ContatoAtual>(
    () =>
      perfil
        ? {
            email: perfil.email,
            telefone: perfil.telefone ? telefoneNacional(perfil.telefone) : "",
          }
        : SEM_CONTATO,
    [perfil],
  );

  // O schema depende do contato salvo, que muda depois de cada troca. O
  // `useForm` relê as opções a cada render, então o resolver novo vale na hora.
  const resolver = useMemo(
    () => zodResolver(criarDadosContatoFormSchema(atual)),
    [atual],
  );

  const valores = useMemo<DadosContatoForm | undefined>(
    () =>
      perfil
        ? {
            nomeExibicao: perfil.nomeExibicao,
            email: perfil.email,
            telefone: formatarTelefone(atual.telefone),
            senhaAtual: "",
          }
        : undefined,
    [perfil, atual],
  );

  const form = useForm<DadosContatoForm>({
    resolver,
    values: valores,
    // Perfil recarregado não apaga o que o usuário já digitou.
    resetOptions: { keepDirtyValues: true },
  });

  const [email, telefone] = useWatch({
    control: form.control,
    name: ["email", "telefone"],
  });
  const pedeSenha =
    Boolean(perfil) &&
    (!mesmoEmail(email ?? "", atual.email) ||
      somenteDigitos(telefone ?? "") !== atual.telefone);

  const aoSalvar = form.handleSubmit(async (dados) => {
    if (!perfil) {
      return;
    }
    setErroServidor(null);

    const novoTelefone = somenteDigitos(dados.telefone);
    const mudou = {
      nomeExibicao: dados.nomeExibicao !== perfil.nomeExibicao,
      email: !mesmoEmail(dados.email, atual.email),
      telefone: novoTelefone !== atual.telefone,
    };

    // Uma chamada por campo alterado ("Editar nome", "Trocar e-mail", "Trocar
    // telefone"). Se uma falha, as anteriores já foram gravadas e o cache já
    // tem os dados novos: tentar de novo só reenvia o que faltou.
    let campo: CampoContato = "nomeExibicao";
    try {
      if (mudou.nomeExibicao) {
        campo = "nomeExibicao";
        await editarNome.mutateAsync(dados.nomeExibicao);
      }
      if (mudou.email) {
        campo = "email";
        await trocarEmail.mutateAsync({
          novoEmail: dados.email,
          senhaAtual: dados.senhaAtual,
        });
      }
      if (mudou.telefone) {
        campo = "telefone";
        await trocarTelefone.mutateAsync({
          novoTelefone,
          senhaAtual: dados.senhaAtual,
        });
      }
      router.back();
    } catch (erro) {
      const resposta = erroApi(erro);
      switch (resposta?.codigo) {
        case CodigoErro.CONTATO_NAO_PERMITIDO:
          // Mensagem genérica da API: não diz se o e-mail já tem conta.
          form.setError("email", { message: resposta.mensagem });
          break;
        case CodigoErro.SENHA_ATUAL_INCORRETA:
          form.setError("senhaAtual", { message: resposta.mensagem });
          break;
        case CodigoErro.VALIDACAO_FALHOU:
          form.setError(campo, { message: resposta.mensagem });
          break;
        default:
          setErroServidor(
            mensagemErroApi(erro, "Não foi possível salvar. Tente novamente."),
          );
      }
    }
  });

  return {
    carregando: query.isPending,
    erroCarregamento:
      query.isError && !perfil
        ? mensagemErroApi(query.error, "Não foi possível carregar seus dados.")
        : null,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    control: form.control,
    erros: form.formState.errors,
    pedeSenha,
    aoSalvar,
    salvando: form.formState.isSubmitting,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
