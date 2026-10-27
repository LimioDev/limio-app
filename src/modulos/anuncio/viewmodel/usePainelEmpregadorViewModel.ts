import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { Estado } from "../../../comum/tipos/api";
import { quandoCurto } from "../servico/anuncio.helpers";
import { usePainelEmpregadorQuery } from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { AnuncioResumo } from "../tipos/anuncio.types";

export interface AnuncioExibido {
  id: string;
  descricao: string;
  fotoUrl: string | null;
  /** "Qua, 03/09 · 14h". */
  quando: string;
  bairro: string | null;
  estado: Estado;
  /** "4 candidatos" ou "com Rafael S.". */
  rodape: string;
}

/** Foto, data e saudação ficam no `CabecalhoInicioView` (módulo `perfil`), composto pela rota. */
export interface PainelExibido {
  anunciosAbertos: number;
  novosCandidatos: number;
  anuncios: AnuncioExibido[];
}

/** Selo do anúncio. `PUBLICADO` com prestador escolhido é o "Combinado" do protótipo. */
function estadoDoSelo(anuncio: AnuncioResumo): Estado {
  switch (anuncio.status) {
    case StatusAnuncio.PUBLICADO:
      return anuncio.prestadorEscolhido ? "combinado" : "aguardando";
    case StatusAnuncio.EM_ANDAMENTO:
      return "andamento";
    case StatusAnuncio.AGUARDANDO_VALIDACAO:
      return "validacao";
    case StatusAnuncio.CONCLUIDO:
      return "concluido";
    case StatusAnuncio.ENCERRADO:
      return "cancelado";
  }
}

function rodape(anuncio: AnuncioResumo): string {
  if (anuncio.prestadorEscolhido) {
    return `com ${anuncio.prestadorEscolhido}`;
  }
  const total = anuncio.candidatos;
  return `${total} ${total === 1 ? "candidato" : "candidatos"}`;
}

function anuncioParaExibicao(anuncio: AnuncioResumo): AnuncioExibido {
  return {
    id: anuncio.id,
    descricao: anuncio.descricao,
    fotoUrl: anuncio.fotoUrl,
    quando: quandoCurto(anuncio.dataHoraPretendida),
    bairro: anuncio.bairro,
    estado: estadoDoSelo(anuncio),
    rodape: rodape(anuncio),
  };
}

export function usePainelEmpregadorViewModel() {
  const router = useRouter();
  const query = usePainelEmpregadorQuery();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const { refetch } = query;

  // Sem painel, a falha já aparece na tela de erro. Com painel em cache, a
  // lista continua visível e o toast avisa que ela não foi atualizada.
  const consultarDeNovo = useCallback(async () => {
    const resultado = await refetch();
    if (resultado.isError && resultado.data) {
      mostrarToast(
        mensagemErroApi(resultado.error, "Não foi possível atualizar seus anúncios."),
        TipoToast.ERRO,
      );
    }
  }, [refetch, mostrarToast]);

  // A tela das abas continua montada ao trocar de aba ou voltar de `novo` e
  // `anuncio/[id]`, então o `staleTime: 0` sozinho não consulta de novo. O
  // primeiro foco é pulado porque o mount já consultou.
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      void consultarDeNovo();
    }, [consultarDeNovo]),
  );

  const painel: PainelExibido | null = query.data
    ? {
        anunciosAbertos: query.data.anunciosAbertos,
        novosCandidatos: query.data.novosCandidatos,
        anuncios: query.data.anuncios.map(anuncioParaExibicao),
      }
    : null;

  return {
    painel,
    carregando: query.isPending,
    erro: query.isError
      ? mensagemErroApi(query.error, "Não foi possível carregar seus anúncios.")
      : null,
    atualizando: query.isRefetching,
    aoAtualizar: () => void consultarDeNovo(),
    aoAbrirNotificacoes: () => router.push("/(app)/notificacoes"),
    aoPublicar: () => router.push("/(app)/(contratante)/novo"),
    aoVerHistorico: () => router.push("/(app)/(contratante)/anuncios"),
    aoAbrirAnuncio: (id: string) =>
      router.push({ pathname: "/(app)/(contratante)/anuncio/[id]", params: { id } }),
  };
}
