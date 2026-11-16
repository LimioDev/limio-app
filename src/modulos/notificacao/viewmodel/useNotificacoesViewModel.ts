import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { chaveDia, formatarDataHora, rotuloDia } from "../../../comum/lib/datas";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { recursoAindaExiste } from "../servico/notificacao.api";
import {
  useMarcarComoLidaMutation,
  useMarcarTodasComoLidasMutation,
  useNotificacoesQuery,
} from "../servico/notificacao.queries";
import type { TipoNotificacao } from "../tipos/notificacao.enums";
import type { Notificacao } from "../tipos/notificacao.types";
import { destinoDaNotificacao } from "./destinoNotificacao";

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

const ROTULO_PAPEL: Record<PapelDoApp, string> = {
  [PapelUsuario.EMPREGADOR]: "Empregador",
  [PapelUsuario.PRESTADOR]: "Prestador",
};

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
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const usuarioId = useSessao((estado) => estado.usuarioId);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useNotificacoesQuery();
  const marcarUma = useMarcarComoLidaMutation();
  const marcarTodas = useMarcarTodasComoLidasMutation();
  const [abrindoId, setAbrindoId] = useState<string | null>(null);

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
    async (id: string) => {
      const notificacao = notificacoes?.find((n) => n.id === id);
      if (!notificacao || abrindoId) {
        return;
      }
      // Marca em paralelo com a abertura: uma falha aqui não impede de abrir,
      // e a bolinha volta a sumir na próxima consulta que der certo.
      if (notificacao.lidaEm === null) {
        marcarUma.mutate(id);
      }

      const destino = destinoDaNotificacao(notificacao, { papelAtivo, usuarioId });
      if (!destino) {
        return;
      }
      if (destino.papel && destino.papel !== papelAtivo) {
        mostrarToast(
          `Troque para o papel de ${ROTULO_PAPEL[destino.papel]} para abrir esta notificação.`,
          TipoToast.ERRO,
        );
        return;
      }
      if (destino.conferir) {
        setAbrindoId(id);
        const existe = await recursoAindaExiste(destino.conferir);
        setAbrindoId(null);
        if (!existe) {
          mostrarToast("Esse anúncio não existe mais.", TipoToast.ERRO);
          return;
        }
      }
      router.push(destino.rota);
    },
    [notificacoes, abrindoId, marcarUma, papelAtivo, usuarioId, mostrarToast, router],
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
    aoTocar: (id: string) => void aoTocar(id),
    aoVoltar: () => router.back(),
  };
}
