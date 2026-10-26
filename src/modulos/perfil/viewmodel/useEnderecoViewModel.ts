import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import {
  useCriarEnderecoMutation,
  useEnderecosQuery,
} from "../../../comum/servico/endereco.queries";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  errosPorCampo,
  FORMULARIO_VAZIO,
  paraFormulario,
  paraRequest,
} from "../servico/endereco.helpers";
import { useEditarEnderecoMutation } from "../servico/endereco.queries";
import { useCidadeEndereco } from "../store/cidadeEndereco.store";
import {
  EnderecoFormSchema,
  type CampoEnderecoForm,
  type EnderecoForm,
  type EnderecoFormEntrada,
} from "../tipos/endereco.types";

/**
 * Tela "Novo endereço". Com `id`, é a edição: a mesma tela com os dados do
 * endereço, que vêm da lista (a API não tem `GET` de um endereço só).
 */
export function useEnderecoViewModel(id?: string) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const editando = Boolean(id);
  const query = useEnderecosQuery({ habilitado: editando });
  const endereco = editando ? query.data?.find((e) => e.id === id) : undefined;
  const criar = useCriarEnderecoMutation();
  const editar = useEditarEnderecoMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const cidadeEscolhida = useCidadeEndereco((estado) => estado.cidade);
  const definirCidade = useCidadeEndereco((estado) => estado.definir);

  const valores = useMemo(
    () => (endereco ? paraFormulario(endereco) : undefined),
    [endereco],
  );

  const form = useForm<EnderecoFormEntrada, unknown, EnderecoForm>({
    resolver: zodResolver(EnderecoFormSchema),
    defaultValues: FORMULARIO_VAZIO,
    values: valores,
    // Lista recarregada não apaga o que o usuário já digitou.
    resetOptions: { keepDirtyValues: true },
  });

  const [cidade, uf] = useWatch({ control: form.control, name: ["cidade", "uf"] });

  // A cidade escolhida não pode vazar pra próxima vez que a tela abrir.
  useEffect(() => () => definirCidade(null), [definirCidade]);

  // Cidade escolhida no seletor → campo do formulário.
  useEffect(() => {
    if (!cidadeEscolhida) {
      return;
    }
    const { getValues, setValue } = form;
    if (getValues("cidade") === cidadeEscolhida.nome && getValues("uf") === cidadeEscolhida.uf) {
      return;
    }
    const opcoes = { shouldDirty: true, shouldValidate: true } as const;
    setValue("cidade", cidadeEscolhida.nome, opcoes);
    setValue("uf", cidadeEscolhida.uf, opcoes);
  }, [cidadeEscolhida, form]);

  const aoSalvar = form.handleSubmit(async (dados) => {
    setErroServidor(null);
    const request = paraRequest(dados);
    try {
      if (id) {
        await editar.mutateAsync({ id, request });
      } else {
        await criar.mutateAsync(request);
      }
      mostrarToast("Endereço salvo");
      router.back();
    } catch (erro) {
      const resposta = erroApi(erro);
      if (resposta?.codigo === CodigoErro.VALIDACAO_FALHOU) {
        const porCampo = Object.entries(errosPorCampo(resposta.mensagem)) as [
          CampoEnderecoForm,
          string,
        ][];
        if (porCampo.length > 0) {
          porCampo.forEach(([campo, mensagem]) => form.setError(campo, { message: mensagem }));
          return;
        }
      }
      // ENDERECO_NAO_LOCALIZADO, GEOCODIFICACAO_INDISPONIVEL, ENDERECO_NAO_ENCONTRADO,
      // ENDERECO_PADRAO_CONFLITO: a mensagem da API já diz o que fazer.
      setErroServidor(
        mensagemErroApi(erro, "Não foi possível salvar o endereço. Tente novamente."),
      );
    }
  });

  let erroCarregamento: string | null = null;
  if (editando && !endereco) {
    if (query.isError) {
      erroCarregamento = mensagemErroApi(query.error, "Não foi possível carregar o endereço.");
    } else if (query.isSuccess) {
      erroCarregamento = "Este endereço não existe mais.";
    }
  }

  return {
    titulo: editando ? "Editar endereço" : "Novo endereço",
    carregando: editando && query.isPending,
    erroCarregamento,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    control: form.control,
    erros: form.formState.errors,
    cidadeUf: cidade && uf ? `${cidade} · ${uf}` : null,
    aoEscolherCidade: () => {
      definirCidade(cidade && uf ? { nome: cidade, uf } : null);
      router.push("/(app)/conta/endereco-cidade");
    },
    aoSalvar,
    salvando: form.formState.isSubmitting,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
