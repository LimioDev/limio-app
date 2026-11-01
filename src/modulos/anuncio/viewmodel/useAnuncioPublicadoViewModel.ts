import { isAxiosError } from "axios";
import { useRouter } from "expo-router";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import { estadoDoAnuncio, quandoCurto } from "../servico/anuncio.helpers";
import { useAnuncioQuery } from "../servico/anuncio.queries";
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
 * Tela 16 "Anúncio publicado": o anúncio do Empregador logado. "Ver todos"
 * abre as telas 18/19 (ETI-68); "Editar" e "Cancelar" ficam desligados até os
 * cards deles chegarem (ETI-61/62 e ETI-63/64).
 */
export function useAnuncioPublicadoViewModel(id: string) {
  const router = useRouter();
  const query = useAnuncioQuery(id);

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
    // Aberta direto pelo link (sem tela antes), volta pro Início.
    aoVoltar: () =>
      router.canGoBack() ? router.back() : router.replace("/(app)/(contratante)"),
    // Telas 18/19 (ETI-68).
    aoVerCandidatos: () =>
      router.push({ pathname: "/(app)/anuncio/[id]/candidatos", params: { id } }),
  };
}
