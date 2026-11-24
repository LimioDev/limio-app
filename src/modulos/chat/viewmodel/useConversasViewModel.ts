import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";

import { normalizarBusca } from "../../../comum/lib/busca";
import { mensagemErroApi } from "../../../comum/lib/erros";
import { chaveCacheFoto } from "../../../comum/lib/foto";
import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { horaConversa, rotuloSeloConversa, seloConversa } from "../servico/chat.helpers";
import { useConsultarConversasDeNovo, useConversasQuery } from "../servico/chat.queries";
import { SeloConversa } from "../tipos/chat.enums";
import type { Conversa } from "../tipos/chat.types";

export interface ConversaExibida {
  candidaturaId: string;
  nome: string;
  fotoUrl: string | null;
  /** Chave estável do cache da foto: o link assinado muda a cada consulta. */
  fotoCacheKey: string | null;
  /** "14:11", "27/08"; vazio enquanto ninguém escreveu. */
  hora: string;
  /** Texto da última mensagem; `null` enquanto ninguém escreveu. */
  ultimaMensagem: string | null;
  selo: SeloConversa;
  rotuloSelo: string;
  tituloAnuncio: string;
  naoLidas: number;
  /** Texto mais claro: a conversa não recebe mais mensagens. */
  encerrada: boolean;
}

function paraExibicao(conversa: Conversa, papel: PapelDoApp): ConversaExibida {
  const selo = seloConversa(conversa.statusCandidatura, conversa.isSomenteLeitura, papel);
  const { outraParte, ultimaMensagem } = conversa;
  return {
    candidaturaId: conversa.candidaturaId,
    nome: outraParte.nome,
    fotoUrl: outraParte.fotoUrl,
    fotoCacheKey: outraParte.fotoUrl ? chaveCacheFoto(outraParte.fotoUrl) : null,
    hora: ultimaMensagem ? horaConversa(ultimaMensagem.enviadaEm) : "",
    ultimaMensagem: ultimaMensagem?.texto ?? null,
    selo,
    rotuloSelo: rotuloSeloConversa(selo),
    tituloAnuncio: conversa.tituloAnuncio,
    naoLidas: conversa.mensagensNaoLidas,
    encerrada: selo === SeloConversa.ENCERRADA,
  };
}

/** "2 não lidas", "1 não lida" ou "Nenhuma não lida". */
function textoNaoLidas(total: number): string {
  if (total === 0) {
    return "Nenhuma não lida";
  }
  return total === 1 ? "1 não lida" : `${total} não lidas`;
}

/**
 * Telas 42 "Conversas" (Empregador) e 42b (Prestador), na aba "Chats" (ETI-104,
 * US49). A rota passa o papel da barra: a API lista pelo papel ativo do token,
 * e cada papel tem a sua lista no cache.
 */
export function useConversasViewModel(papel: PapelDoApp) {
  const router = useRouter();
  const query = useConversasQuery(papel);
  const consultarDeNovo = useConsultarConversasDeNovo(papel);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState("");
  // Só o gesto de puxar (ou "Tentar de novo") gira a rodinha, não a nova
  // consulta ao voltar pra aba.
  const [puxando, setPuxando] = useState(false);

  // A aba continua montada: ao voltar pra ela (do chat, de outra aba), consulta
  // de novo, porque mensagens e não lidas mudam fora da tela. O primeiro foco
  // é pulado porque o mount já consultou.
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

  const conversas = useMemo(
    () =>
      query.data?.pages
        .flatMap((pagina) => pagina.conversas.content)
        .map((conversa) => paraExibicao(conversa, papel)) ?? null,
    [query.data, papel],
  );

  // A API não busca por texto: a lupa filtra o que já foi carregado, pelo
  // nome da outra parte e pelo título do anúncio.
  const termo = normalizarBusca(busca);
  const conversasVisiveis = useMemo(() => {
    if (!conversas || !termo) {
      return conversas;
    }
    return conversas.filter(
      (c) => normalizarBusca(c.nome).includes(termo) || normalizarBusca(c.tituloAnuncio).includes(termo),
    );
  }, [conversas, termo]);

  const totalComNaoLidas = query.data?.pages[0]?.totalComNaoLidas ?? 0;
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const atualizar = useCallback(async () => {
    setPuxando(true);
    try {
      await consultarDeNovo();
    } finally {
      setPuxando(false);
    }
  }, [consultarDeNovo]);

  return {
    conversas: conversasVisiveis,
    carregando: query.isPending,
    erro:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar suas conversas.")
        : null,
    subtitulo: textoNaoLidas(totalComNaoLidas),
    semConversas: conversas !== null && conversas.length === 0,
    ehEmpregador: papel === PapelUsuario.EMPREGADOR,
    buscaAberta,
    busca,
    buscaSemResultado: termo.length > 0 && conversasVisiveis?.length === 0,
    aoAlternarBusca: () => {
      setBuscaAberta((aberta) => !aberta);
      setBusca("");
    },
    aoBuscar: setBusca,
    atualizando: puxando,
    aoAtualizar: () => void atualizar(),
    carregandoMais: isFetchingNextPage,
    aoFimDaLista: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    aoAbrirConversa: (candidaturaId: string) =>
      router.push({ pathname: "/(app)/chat/[aplicacaoId]", params: { aplicacaoId: candidaturaId } }),
  };
}

export type ConversasViewModel = ReturnType<typeof useConversasViewModel>;
