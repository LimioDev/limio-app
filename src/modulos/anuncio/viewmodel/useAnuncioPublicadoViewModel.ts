import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { anuncioNaoEncontrado, estadoDoAnuncio, quandoCurto } from "../servico/anuncio.helpers";
import {
  useAnuncioQuery,
  useCancelarAnuncioMutation,
  usePrestadorEscolhidoNoPainelQuery,
} from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { AnuncioDetalheResponse } from "../tipos/anuncio.types";

export interface AnuncioPublicadoExibido {
  estado: Estado;
  titulo: string;
  /** "Qua, 03/09 · 14h". */
  quando: string;
  /** "Pinheiros · SP"; `null` sem bairro. */
  local: string | null;
  /** "4 prestadores se candidataram". */
  resumoCandidatos: string;
  temCandidatos: boolean;
  /** Candidaturas `ENVIADA`, pro texto da folha de cancelar (tela 17). */
  candidaturasPendentes: number;
  /**
   * Só aguardando candidatos. Combinado, os outros já foram encerrados e o card
   * diria "Nenhum prestador se candidatou ainda" logo depois da escolha (tela 23,
   * ETI-70), que abre esta tela até a tela 25 chegar (ETI-87).
   */
  aguardandoCandidatos: boolean;
  /** Botões "Editar" (ETI-62) e "Cancelar" (ETI-64): só em `PUBLICADO` sem candidatura escolhida. */
  podeAlterar: boolean;
  avatares: { chave: string; nome: string; fotoUrl: string | null }[];
  descricao: string;
  fotos: { chave: string; uri: string }[];
  tamanhoLocal: string | null;
  pessoasNoLocal: string | null;
}

function resumoCandidatos(total: number): string {
  if (total === 0) {
    return "Nenhum prestador se candidatou ainda";
  }
  return total === 1 ? "1 prestador se candidatou" : `${total} prestadores se candidataram`;
}

/**
 * `prestadorEscolhido`: nome abreviado, `null` sem escolhido, `undefined`
 * enquanto não se sabe (o painel ainda não respondeu). `jaCombinado`: a API
 * recusou o cancelamento com `ANUNCIO_ESTADO_INVALIDO` nesta tela.
 */
function paraExibicao(
  anuncio: AnuncioDetalheResponse,
  prestadorEscolhido: string | null | undefined,
  jaCombinado: boolean,
): AnuncioPublicadoExibido {
  const temEscolhido = Boolean(prestadorEscolhido) || jaCombinado;
  const local = anuncio.bairroRegiao
    ? [anuncio.bairroRegiao, anuncio.uf].filter(Boolean).join(" · ")
    : null;
  const estado = estadoDoAnuncio(anuncio.status, temEscolhido);
  return {
    estado,
    aguardandoCandidatos: estado === "aguardando",
    titulo: anuncio.titulo,
    quando: quandoCurto(anuncio.dataHoraPretendida),
    local,
    resumoCandidatos: resumoCandidatos(anuncio.candidatos),
    temCandidatos: anuncio.candidatos > 0,
    candidaturasPendentes: anuncio.candidatos,
    // Sem saber ainda se há escolhido, os botões ficam escondidos: a folha diz
    // "ninguém foi escolhido" e não pode aparecer em anúncio combinado.
    podeAlterar:
      anuncio.status === StatusAnuncio.PUBLICADO &&
      prestadorEscolhido === null &&
      !jaCombinado,
    avatares: anuncio.primeirosCandidatos.slice(0, 4).map((c, i) => ({
      chave: `${i}-${c.nome}`,
      nome: c.nome,
      fotoUrl: c.fotoUrl,
    })),
    descricao: anuncio.descricao,
    fotos: anuncio.fotos.map((f) => ({ chave: f.id, uri: f.url })),
    tamanhoLocal: anuncio.tamanhoLocal,
    pessoasNoLocal: anuncio.numeroPessoas !== null ? String(anuncio.numeroPessoas) : null,
  };
}

/**
 * Tela 16 "Anúncio publicado": o anúncio do Empregador logado, com a folha de
 * cancelar (tela 17, ETI-64). "Ver todos" abre as telas 18/19 (ETI-68) e
 * "Editar", a tela 16a (ETI-62).
 */
export function useAnuncioPublicadoViewModel(id: string) {
  const router = useRouter();
  const query = useAnuncioQuery(id);
  const escolhidoNoPainel = usePrestadorEscolhidoNoPainelQuery(id);
  const cancelar = useCancelarAnuncioMutation();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [folhaCancelarVisivel, setFolhaCancelarVisivel] = useState(false);
  const [erroCancelar, setErroCancelar] = useState<string | null>(null);
  // Guarda o 409 até sair da tela: sem isso, o refetch traria o botão de volta
  // se o painel ainda não refletisse a escolha.
  const [jaCombinado, setJaCombinado] = useState(false);

  const recarregar = () => {
    void query.refetch();
    void escolhidoNoPainel.refetch();
  };

  const aoConfirmarCancelar = async () => {
    if (cancelar.isPending) {
      return;
    }
    setErroCancelar(null);
    try {
      await cancelar.mutateAsync(id);
      setFolhaCancelarVisivel(false);
      mostrarToast("Anúncio cancelado");
      // Tela 13b: o Início já sem o anúncio.
      router.dismissTo("/(app)/(contratante)");
    } catch (erro) {
      if (erroApi(erro)?.codigo === CodigoErro.ANUNCIO_ESTADO_INVALIDO) {
        setFolhaCancelarVisivel(false);
        setJaCombinado(true);
        mostrarToast("Este anúncio já foi combinado", TipoToast.ERRO);
        recarregar();
        return;
      }
      // Na folha, não em toast: o modal fica por cima do toast.
      setErroCancelar(mensagemErroApi(erro, "Não foi possível cancelar o anúncio."));
    }
  };

  let erro: string | null = null;
  if (query.isError && !query.data) {
    erro = anuncioNaoEncontrado(query.error)
      ? "Este anúncio não existe ou não é seu."
      : mensagemErroApi(query.error, "Não foi possível carregar o anúncio.");
  }

  return {
    carregando: query.isPending,
    erro,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    anuncio: query.data
      ? paraExibicao(
          query.data,
          // O detalhe manda quando o back passar a trazer o campo.
          query.data.prestadorEscolhido !== undefined
            ? query.data.prestadorEscolhido
            : escolhidoNoPainel.data,
          jaCombinado,
        )
      : null,
    atualizando: query.isRefetching,
    aoAtualizar: recarregar,
    folhaCancelarVisivel,
    cancelando: cancelar.isPending,
    erroCancelar,
    aoAbrirCancelar: () => {
      setErroCancelar(null);
      setFolhaCancelarVisivel(true);
    },
    aoConfirmarCancelar: () => void aoConfirmarCancelar(),
    // "Manter no mural": fecha sem chamar a API.
    aoManterNoMural: () => setFolhaCancelarVisivel(false),
    // Aberta direto pelo link (sem tela antes), volta pro Início.
    aoVoltar: () =>
      router.canGoBack() ? router.back() : router.replace("/(app)/(contratante)"),
    // Tela 16a (ETI-62). Se ainda dá pra editar quem decide é a API, ao salvar.
    aoEditar: () => router.push({ pathname: "/(app)/anuncio/[id]/editar", params: { id } }),
    // Telas 18/19 (ETI-68).
    aoVerCandidatos: () =>
      router.push({ pathname: "/(app)/anuncio/[id]/candidatos", params: { id } }),
  };
}
