import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { estadoDoAnuncio, quandoCurto } from "../servico/anuncio.helpers";
import { useAnuncioQuery, useCancelarAnuncioMutation } from "../servico/anuncio.queries";
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
  /** Botão "Cancelar" (ETI-64): só em `PUBLICADO` sem candidatura escolhida. */
  podeCancelar: boolean;
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

function paraExibicao(anuncio: AnuncioDetalheResponse): AnuncioPublicadoExibido {
  const local = anuncio.bairroRegiao
    ? [anuncio.bairroRegiao, anuncio.uf].filter(Boolean).join(" · ")
    : null;
  return {
    // O detalhe ainda não diz se há prestador escolhido (card de candidatos, ETI-67/68).
    estado: estadoDoAnuncio(anuncio.status, false),
    titulo: anuncio.titulo,
    quando: quandoCurto(anuncio.dataHoraPretendida),
    local,
    resumoCandidatos: resumoCandidatos(anuncio.candidatos),
    temCandidatos: anuncio.candidatos > 0,
    candidaturasPendentes: anuncio.candidatos,
    // O detalhe ainda não diz se há escolhida; se houver, a API recusa com
    // `ANUNCIO_ESTADO_INVALIDO` e a tela recarrega.
    podeCancelar: anuncio.status === StatusAnuncio.PUBLICADO,
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

function naoEncontrado(erro: unknown): boolean {
  return (
    erroApi(erro)?.codigo === CodigoErro.ANUNCIO_NAO_ENCONTRADO ||
    (isAxiosError(erro) && erro.response?.status === 404)
  );
}

/**
 * Tela 16 "Anúncio publicado": o anúncio do Empregador logado, com a folha de
 * cancelar (tela 17, ETI-64). "Ver todos" e "Editar" ficam desligados até os
 * cards deles chegarem (ETI-67/68 e ETI-61/62).
 */
export function useAnuncioPublicadoViewModel(id: string) {
  const router = useRouter();
  const query = useAnuncioQuery(id);
  const cancelar = useCancelarAnuncioMutation();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [folhaCancelarVisivel, setFolhaCancelarVisivel] = useState(false);
  const [erroCancelar, setErroCancelar] = useState<string | null>(null);

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
        mostrarToast("Este anúncio já foi combinado", TipoToast.ERRO);
        void query.refetch();
        return;
      }
      // Na folha, não em toast: o modal fica por cima do toast.
      setErroCancelar(mensagemErroApi(erro, "Não foi possível cancelar o anúncio."));
    }
  };

  let erro: string | null = null;
  if (query.isError && !query.data) {
    erro = naoEncontrado(query.error)
      ? "Este anúncio não existe ou não é seu."
      : mensagemErroApi(query.error, "Não foi possível carregar o anúncio.");
  }

  return {
    carregando: query.isPending,
    erro,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    anuncio: query.data ? paraExibicao(query.data) : null,
    atualizando: query.isRefetching,
    aoAtualizar: () => {
      void query.refetch();
    },
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
  };
}
