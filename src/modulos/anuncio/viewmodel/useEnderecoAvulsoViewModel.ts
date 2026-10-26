import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { CAMPOS_ENDERECO_VAZIOS, formatarCep } from "../../../comum/lib/endereco";
import {
  CamposEnderecoFormSchema,
  type CamposEnderecoForm,
  type CamposEnderecoFormEntrada,
} from "../../../comum/tipos/endereco";
import { rotuloMunicipio } from "../../../comum/tipos/localidade";
import { useRascunhoAnuncio } from "../store/rascunhoAnuncio.store";

function paraEntrada(campos: CamposEnderecoForm): CamposEnderecoFormEntrada {
  return { ...campos, cep: formatarCep(campos.cep) };
}

/**
 * "+ Usar outro endereço" da tela 15: os campos do "Novo endereço", sem apelido
 * nem padrão. Vale só pra este anúncio — não entra nos endereços salvos.
 */
export function useEnderecoAvulsoViewModel() {
  const router = useRouter();
  const usarAvulso = useRascunhoAnuncio((estado) => estado.usarAvulso);
  const cidadeEscolhida = useRascunhoAnuncio((estado) => estado.cidadeAvulso);
  const definirCidade = useRascunhoAnuncio((estado) => estado.definirCidadeAvulso);

  const form = useForm<CamposEnderecoFormEntrada, unknown, CamposEnderecoForm>({
    resolver: zodResolver(CamposEnderecoFormSchema),
    defaultValues: (() => {
      const atual = useRascunhoAnuncio.getState().rascunho.avulso;
      return atual ? paraEntrada(atual) : CAMPOS_ENDERECO_VAZIOS;
    })(),
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

  return {
    control: form.control,
    erros: form.formState.errors,
    cidadeUf: cidade && uf ? rotuloMunicipio(cidade, uf) : null,
    aoEscolherCidade: () => {
      definirCidade(cidade && uf ? { nome: cidade, uf } : null);
      router.push("/(app)/anuncio/novo/endereco-cidade");
    },
    // O endereço só é conferido (geocodificado) pela API ao publicar.
    aoUsar: form.handleSubmit((dados) => {
      usarAvulso(dados);
      router.back();
    }),
    aoVoltar: () => router.back(),
  };
}
