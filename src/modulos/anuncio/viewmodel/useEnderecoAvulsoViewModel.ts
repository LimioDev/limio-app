import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  CAMPO_ENDERECO_DA_API,
  CAMPOS_ENDERECO_VAZIOS,
  formatarCep,
  paraCamposRequest,
} from "../../../comum/lib/endereco";
import { erroApi, errosPorCampo, mensagemErroApi } from "../../../comum/lib/erros";
import { useCriarEnderecoMutation } from "../../../comum/servico/endereco.queries";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { rotuloMunicipio } from "../../../comum/tipos/localidade";
import { useRascunhoAnuncio, type EnderecoAvulso } from "../store/rascunhoAnuncio.store";
import {
  EnderecoAnuncioFormSchema,
  type EnderecoAnuncioForm,
  type EnderecoAnuncioFormEntrada,
} from "../tipos/anuncio.types";

type CampoEnderecoAnuncio = keyof EnderecoAnuncioFormEntrada;

/** Nome do campo no `EnderecoSalvoRequest` da API → campo do formulário. */
const CAMPO_DA_API: Record<string, CampoEnderecoAnuncio> = {
  apelido: "apelido",
  ...CAMPO_ENDERECO_DA_API,
};

function valoresIniciais(avulso: EnderecoAvulso | null): EnderecoAnuncioFormEntrada {
  // Reabrir o avulso pra editar: continua avulso. Endereço novo: salvar vem ligado (Figma 15b).
  return avulso
    ? { ...avulso, cep: formatarCep(avulso.cep), salvar: false }
    : { apelido: "", ...CAMPOS_ENDERECO_VAZIOS, salvar: true };
}

/**
 * Tela 15b "Novo endereço" do anúncio ("+ Usar outro endereço" da tela 15).
 * "Salvar este endereço para depois" ligado: cadastra nos endereços salvos e o
 * anúncio usa ele. Desligado: o endereço vale só pra este anúncio (avulso).
 */
export function useEnderecoAvulsoViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const usarAvulso = useRascunhoAnuncio((estado) => estado.usarAvulso);
  const usarSalvoNovo = useRascunhoAnuncio((estado) => estado.usarSalvoNovo);
  const cidadeEscolhida = useRascunhoAnuncio((estado) => estado.cidadeAvulso);
  const definirCidade = useRascunhoAnuncio((estado) => estado.definirCidadeAvulso);
  const criar = useCriarEnderecoMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<EnderecoAnuncioFormEntrada, unknown, EnderecoAnuncioForm>({
    resolver: zodResolver(EnderecoAnuncioFormSchema),
    defaultValues: valoresIniciais(useRascunhoAnuncio.getState().rascunho.avulso),
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

  const aoUsar = form.handleSubmit(async ({ salvar, apelido, ...campos }) => {
    setErroServidor(null);
    if (!salvar) {
      // Avulso: a API só confere (geocodifica) o endereço ao publicar.
      usarAvulso({ ...campos, apelido });
      router.back();
      return;
    }
    try {
      const salvo = await criar.mutateAsync({
        apelido,
        ...paraCamposRequest(campos),
        isPadrao: false,
      });
      usarSalvoNovo(salvo.id);
      mostrarToast("Endereço salvo");
      router.back();
    } catch (erro) {
      const resposta = erroApi(erro);
      if (resposta?.codigo === CodigoErro.VALIDACAO_FALHOU) {
        const porCampo = Object.entries(errosPorCampo(resposta.mensagem, CAMPO_DA_API)) as [
          CampoEnderecoAnuncio,
          string,
        ][];
        if (porCampo.length > 0) {
          porCampo.forEach(([campo, mensagem]) => form.setError(campo, { message: mensagem }));
          return;
        }
      }
      // ENDERECO_NAO_LOCALIZADO, GEOCODIFICACAO_INDISPONIVEL: a mensagem da API diz o que fazer.
      setErroServidor(
        mensagemErroApi(erro, "Não foi possível salvar o endereço. Tente novamente."),
      );
    }
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    cidadeUf: cidade && uf ? rotuloMunicipio(cidade, uf) : null,
    aoEscolherCidade: () => {
      definirCidade(cidade && uf ? { nome: cidade, uf } : null);
      router.push("/(app)/anuncio/novo/endereco-cidade");
    },
    aoUsar,
    usando: form.formState.isSubmitting,
    erroServidor,
    aoVoltar: () => router.back(),
  };
}
