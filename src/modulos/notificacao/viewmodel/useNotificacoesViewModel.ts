import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { chaveDia, formatarDataHora, rotuloDia } from "../../../comum/lib/datas";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import {
  useMarcarTodasComoLidasMutation,
  useNotificacoesQuery,
} from "../servico/notificacao.queries";
import type { TipoNotificacao } from "../tipos/notificacao.enums";
import type { Notificacao } from "../tipos/notificacao.types";
import { useAbrirNotificacao } from "./useAbrirNotificacao";

export interface NotificacaoExibida {
  id: string;
  /** `null` = tipo que o app ainda não conhece (ícone genérico). */
  tipo: TipoNotificacao | null;
  titulo: string;
  corpo: string;
  /** "14:22", no fuso do sistema. */
  hora: string;
  naoLida: boolean;
}

/** Seção da lista: "Hoje", "Ontem", "2 de novembro". */
export interface SecaoNotificacoes {
  chave: string;
  titulo: string;
  data: NotificacaoExibida[];
}

function paraExibicao(notificacao: Notificacao): NotificacaoExibida {
  return {
    id: notificacao.id,
    tipo: notificacao.tipo,
    titulo: notificacao.titulo,
    corpo: notificacao.corpo,
    hora: formatarDataHora(notificacao.enviadaEm, "HH:mm"),
    naoLida: notificacao.lidaEm === null,
  };
}

/** A API já manda da mais nova pra mais antiga: agrupa dias consecutivos. */
function agruparPorDia(notificacoes: Notificacao[]): SecaoNotificacoes[] {
  const secoes: SecaoNotificacoes[] = [];
  for (const notificacao of notificacoes) {
    const chave = chaveDia(notificacao.enviadaEm);
    const atual = secoes[secoes.length - 1];
    if (atual?.chave === chave) {
      atual.data.push(paraExibicao(notificacao));
    } else {
      secoes.push({
        chave,
        titulo: rotuloDia(notificacao.enviadaEm),
        data: [paraExibicao(notificacao)],
      });
    }
  }
  return secoes;
}

/** Tela 43 "Notificações" (ETI-111, US55). */
export function useNotificacoesViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useNotificacoesQuery();
  const marcarTodas = useMarcarTodasComoLidasMutation();
  const { abrir, abrindoId } = useAbrirNotificacao();

  const notificacoes = useMemo(
    () => query.data?.pages.flatMap((pagina) => pagina.notificacoes.content) ?? null,
    [query.data],
  );
  const secoes = useMemo(
    () => (notificacoes ? agruparPorDia(notificacoes) : null),
    [notificacoes],
  );
  const naoLidas = query.data?.pages[0]?.naoLidas ?? 0;

  const aoTocar = useCallback(
    (id: string) => {
      const notificacao = notificacoes?.find((n) => n.id === id);
      if (notificacao) {
        // Sem tela ligada: só marca como lida e fica na lista.
        void abrir({ ...notificacao, naoLida: notificacao.lidaEm === null });
      }
    },
    [notificacoes, abrir],
  );

  const aoMarcarTodas = useCallback(() => {
    marcarTodas.mutate(undefined, {
      onError: (erro) =>
        mostrarToast(
          mensagemErroApi(erro, "Não foi possível marcar as notificações como lidas."),
          TipoToast.ERRO,
        ),
    });
  }, [marcarTodas, mostrarToast]);

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  return {
    secoes,
    carregando: query.isPending,
    erro:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar suas notificações.")
        : null,
    aoTentarDeNovo: () => void refetch(),
    atualizando: query.isRefetching && !isFetchingNextPage,
    aoAtualizar: () => void refetch(),
    carregandoMais: isFetchingNextPage,
    aoFimDaLista: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    podeMarcarTodas: naoLidas > 0 && !marcarTodas.isPending,
    aoMarcarTodas,
    abrindoId,
    aoTocar,
    aoVoltar: () => router.back(),
  };
}
