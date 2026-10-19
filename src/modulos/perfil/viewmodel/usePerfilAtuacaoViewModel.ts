import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import { agruparJanelas, rotuloMunicipio } from "../servico/atuacao.helpers";
import {
  chavesAtuacao,
  useCategoriasQuery,
  usePerfilAtuacaoQuery,
  useSalvarPerfilAtuacaoMutation,
} from "../servico/atuacao.queries";
import {
  useRascunhoAtuacao,
  type ErrosAtuacao,
  type RascunhoAtuacao,
} from "../store/rascunhoAtuacao.store";
import {
  PerfilAtuacaoRequestSchema,
  RAIO_MAX_KM,
  RAIO_MIN_KM,
} from "../tipos/atuacao.types";

interface Opcoes {
  /**
   * O que fazer depois de salvar. Sem isso, volta pra tela anterior ("Meu
   * perfil"). Vindo da troca de papel, a rota passa a troca pra Prestador.
   */
  aoConcluir?: () => void | Promise<void>;
}

/** Erros do schema do PUT, por campo da tela. */
function errosDoRascunho(rascunho: RascunhoAtuacao): ErrosAtuacao | null {
  const resultado = PerfilAtuacaoRequestSchema.safeParse({
    especialidades: rascunho.especialidades.map((categoria) => categoria.id),
    raioAtendimentoKm: rascunho.raioAtendimentoKm,
    municipioBase: rascunho.municipio?.nome ?? "",
    ufBase: rascunho.municipio?.uf,
    janelas: rascunho.janelas,
  });
  if (resultado.success) {
    return null;
  }
  const erros: ErrosAtuacao = {};
  for (const problema of resultado.error.issues) {
    switch (problema.path[0]) {
      case "especialidades":
        erros.especialidades ??= problema.message;
        break;
      case "raioAtendimentoKm":
        erros.raio ??= problema.message;
        break;
      case "municipioBase":
      case "ufBase":
        erros.municipio ??= problema.message;
        break;
      case "janelas":
        erros.janelas ??= problema.message;
        break;
    }
  }
  return erros;
}

export function usePerfilAtuacaoViewModel({ aoConcluir }: Opcoes = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = usePerfilAtuacaoQuery();
  const categorias = useCategoriasQuery();
  const mutation = useSalvarPerfilAtuacaoMutation();
  const rascunho = useRascunhoAtuacao((estado) => estado.rascunho);
  const erros = useRascunhoAtuacao((estado) => estado.erros);
  const iniciar = useRascunhoAtuacao((estado) => estado.iniciar);
  const definirRaio = useRascunhoAtuacao((estado) => estado.definirRaio);
  const definirErros = useRascunhoAtuacao((estado) => estado.definirErros);
  const descartar = useRascunhoAtuacao((estado) => estado.descartar);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  // O rascunho começa com o que a API devolveu e vive enquanto a tela 10
  // estiver aberta (as subtelas abrem por cima dela).
  useEffect(() => {
    if (query.data && !useRascunhoAtuacao.getState().rascunho) {
      iniciar(query.data);
    }
  }, [query.data, iniciar]);
  useEffect(() => descartar, [descartar]);

  const aoSalvar = async () => {
    if (!rascunho || mutation.isPending) {
      return;
    }
    setErroServidor(null);
    const errosLocais = errosDoRascunho(rascunho);
    if (errosLocais) {
      definirErros(errosLocais);
      return;
    }

    try {
      await mutation.mutateAsync({
        especialidades: rascunho.especialidades.map((categoria) => categoria.id),
        raioAtendimentoKm: rascunho.raioAtendimentoKm,
        municipioBase: rascunho.municipio!.nome,
        ufBase: rascunho.municipio!.uf,
        janelas: rascunho.janelas,
      });
    } catch (erro) {
      const resposta = erroApi(erro);
      switch (resposta?.codigo) {
        case CodigoErro.CATEGORIA_INVALIDA:
          // Alguma categoria foi desativada: a lista é recarregada pra nova escolha.
          void queryClient.invalidateQueries({ queryKey: chavesAtuacao.categorias });
          definirErros({ especialidades: resposta.mensagem });
          return;
        case CodigoErro.MUNICIPIO_NAO_ENCONTRADO:
          definirErros({ municipio: resposta.mensagem });
          return;
        default:
          setErroServidor(
            mensagemErroApi(erro, "Não foi possível salvar. Tente novamente."),
          );
          return;
      }
    }

    if (aoConcluir) {
      await aoConcluir();
    } else {
      router.back();
    }
  };

  const totalCategorias = categorias.data?.length ?? null;
  const qtdEspecialidades = rascunho?.especialidades.length ?? 0;

  return {
    carregando: query.isPending || (Boolean(query.data) && !rascunho),
    erroCarregamento:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar seu perfil de atuação.")
        : null,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    especialidades: rascunho?.especialidades.map((categoria) => categoria.nome) ?? [],
    contadorEspecialidades:
      totalCategorias === null ? null : `${qtdEspecialidades} de ${totalCategorias}`,
    semEspecialidades: qtdEspecialidades === 0,
    raio: rascunho?.raioAtendimentoKm ?? RAIO_MIN_KM,
    raioMin: RAIO_MIN_KM,
    raioMax: RAIO_MAX_KM,
    aoMudarRaio: definirRaio,
    municipio: rascunho?.municipio
      ? rotuloMunicipio(rascunho.municipio.nome, rascunho.municipio.uf)
      : null,
    janelas: rascunho ? agruparJanelas(rascunho.janelas) : [],
    erros,
    erroServidor,
    salvando: mutation.isPending,
    aoSalvar,
    aoVoltar: () => router.back(),
    aoEscolherEspecialidades: () => router.push("/(app)/conta/especialidades"),
    aoEscolherMunicipio: () => router.push("/(app)/conta/municipio-base"),
    aoEditarJanelas: () => router.push("/(app)/conta/janelas-horario"),
  };
}
