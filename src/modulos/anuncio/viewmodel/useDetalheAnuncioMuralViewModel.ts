import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  diaComData,
  formatarDistancia,
  horaPretendida,
} from "../servico/anuncio.helpers";
import { useDetalheAnuncioMuralQuery } from "../servico/anuncio.queries";
import { StatusCandidatura } from "../tipos/anuncio.enums";
import type { DetalheAnuncioMural } from "../tipos/anuncio.types";

export interface SituacaoCandidaturaExibida {
  titulo: string;
  descricao: string;
}

export interface DetalheMuralExibido {
  fotos: string[];
  categoria: string;
  /** "1,8 km de você". */
  distancia: string;
  titulo: string;
  /** "Qua, 03/09". */
  dia: string;
  /** "14:00". */
  hora: string;
  /** Bairro, ou a cidade quando o anúncio não tem bairro. */
  local: string;
  /** "São Paulo · SP". */
  cidadeUf: string;
  descricao: string;
  empregador: {
    nome: string;
    fotoUrl: string | null;
    /** `null` enquanto o Empregador não tem avaliação. */
    reputacao: { nota: number; totalAvaliacoes: number } | null;
  };
  /** Preenchida quando o Prestador já se candidatou: substitui "Candidatar-se". */
  candidatura: SituacaoCandidaturaExibida | null;
}

function situacaoCandidatura(status: StatusCandidatura): SituacaoCandidaturaExibida {
  switch (status) {
    case StatusCandidatura.ENVIADA:
      return {
        titulo: "Candidatura enviada",
        descricao: "O Empregador está analisando os candidatos. Avisaremos você se for o escolhido.",
      };
    case StatusCandidatura.ESCOLHIDA:
      return {
        titulo: "Você foi escolhido",
        descricao: "Combine os detalhes do serviço com o Empregador pelo chat.",
      };
    case StatusCandidatura.CANCELADA:
      return {
        titulo: "Candidatura cancelada",
        descricao: "Você não está mais concorrendo a este serviço.",
      };
  }
}

function detalheParaExibicao(anuncio: DetalheAnuncioMural): DetalheMuralExibido {
  const { empregador } = anuncio;
  return {
    fotos: anuncio.fotos,
    categoria: anuncio.categoria.nome,
    distancia: `${formatarDistancia(anuncio.distanciaKm)} de você`,
    titulo: anuncio.titulo,
    dia: diaComData(anuncio.dataHoraPretendida),
    hora: horaPretendida(anuncio.dataHoraPretendida),
    local: anuncio.bairro ?? anuncio.cidade,
    cidadeUf: `${anuncio.cidade} · ${anuncio.uf}`,
    descricao: anuncio.descricao,
    empregador: {
      nome: empregador.nomeExibicao,
      fotoUrl: empregador.fotoUrl,
      reputacao:
        empregador.mediaAvaliacoes !== null && empregador.totalAvaliacoes > 0
          ? { nota: empregador.mediaAvaliacoes, totalAvaliacoes: empregador.totalAvaliacoes }
          : null,
    },
    candidatura: anuncio.minhaCandidatura
      ? situacaoCandidatura(anuncio.minhaCandidatura.status)
      : null,
  };
}

/** Tela 30 "Detalhe do anúncio" vista pelo Prestador, aberta pelo mural. */
export function useDetalheAnuncioMuralViewModel(id: string) {
  const router = useRouter();
  const query = useDetalheAnuncioMuralQuery(id);
  const [fotoAtual, setFotoAtual] = useState(0);

  let erro: string | null = null;
  if (query.isError && !query.data) {
    erro =
      erroApi(query.error)?.codigo === CodigoErro.ANUNCIO_NAO_ENCONTRADO
        ? "Este anúncio não está mais disponível no mural."
        : mensagemErroApi(query.error, "Não foi possível carregar o anúncio.");
  }

  return {
    anuncio: query.data ? detalheParaExibicao(query.data) : null,
    carregando: query.isPending,
    erro,
    atualizando: query.isRefetching,
    fotoAtual,
    aoMudarFoto: setFotoAtual,
    aoTentarDeNovo: () => void query.refetch(),
    aoVoltar: () => router.back(),
    // "Candidatar-se" chega com o ETI-75/ETI-76 e "Ver perfil" com o ETI-106;
    // até lá, o botão fica desabilitado e o link escondido.
    aoCandidatar: undefined as (() => void) | undefined,
    aoVerPerfilEmpregador: undefined as (() => void) | undefined,
  };
}
