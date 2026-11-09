import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { useToast } from "../../../comum/store/toast";
import { StatusAplicacao } from "../../../comum/tipos/aplicacao";
import { CodigoErro } from "../../../comum/tipos/erros";
import { marcarEntregues } from "../servico/chat.api";
import {
  avisoSomenteLeitura,
  chaveDia,
  horaMensagem,
  primeiroNome,
  rotuloDia,
} from "../servico/chat.helpers";
import {
  confirmarMensagensNoCache,
  inserirMensagemNoCache,
  useChatQuery,
  useEnviarMensagemMutation,
  useMarcarLidasMutation,
  useUsuarioIdQuery,
} from "../servico/chat.queries";
import { useCanalChat } from "../servico/chat.tempoReal";
import { PapelNoChat, SituacaoMensagem, TipoEventoChat } from "../tipos/chat.enums";
import { TEXTO_MENSAGEM_MAX, type Mensagem } from "../tipos/chat.types";

const EM_BREVE = "Em breve";

/** Mensagem minha que ainda não voltou da API (balão na hora, confirmado depois). */
interface MensagemPendente {
  idLocal: string;
  texto: string;
  dataEnvio: string;
  falhou: boolean;
}

export type ItemConversa =
  | { tipo: "dia"; chave: string; rotulo: string }
  | {
      tipo: "mensagem";
      chave: string;
      texto: string;
      hora: string;
      minha: boolean;
      /** Checks do balão; só nas minhas mensagens. */
      situacao: SituacaoMensagem | null;
      /** Preenchido nas pendentes: "Tentar de novo" reenvia por ele. */
      idLocal: string | null;
    };

export interface CabecalhoChatExibido {
  nome: string;
  fotoUrl: string | null;
  /** "Candidato · Elétrica" para o Empregador; título do anúncio para o Prestador. */
  subtitulo: string;
  somenteLeitura: boolean;
}

function situacaoDaMensagem(mensagem: Mensagem): SituacaoMensagem {
  if (mensagem.lidaEm) {
    return SituacaoMensagem.LIDA;
  }
  return mensagem.entregueEm ? SituacaoMensagem.ENTREGUE : SituacaoMensagem.ENVIADA;
}

/**
 * Lista da conversa da mais nova para a mais antiga (a `FlatList` é
 * invertida): pendentes primeiro, depois as gravadas, e um separador de dia
 * depois da mais antiga de cada dia (aparece acima dela na tela).
 */
function montarItens(
  mensagens: Mensagem[],
  pendentes: MensagemPendente[],
  usuarioId: string | null,
): ItemConversa[] {
  const todas = [
    ...[...pendentes].reverse().map((p) => ({
      chave: p.idLocal,
      texto: p.texto,
      dataEnvio: p.dataEnvio,
      minha: true,
      situacao: p.falhou ? SituacaoMensagem.NAO_ENVIADA : SituacaoMensagem.ENVIANDO,
      idLocal: p.idLocal as string | null,
    })),
    ...mensagens.map((m) => {
      const minha = m.remetenteId === usuarioId;
      return {
        chave: m.id,
        texto: m.texto,
        dataEnvio: m.dataEnvio,
        minha,
        situacao: minha ? situacaoDaMensagem(m) : null,
        idLocal: null,
      };
    }),
  ];

  const itens: ItemConversa[] = [];
  todas.forEach((m, i) => {
    itens.push({
      tipo: "mensagem",
      chave: m.chave,
      texto: m.texto,
      hora: horaMensagem(m.dataEnvio),
      minha: m.minha,
      situacao: m.situacao,
      idLocal: m.idLocal,
    });
    const anterior = todas[i + 1];
    if (!anterior || chaveDia(anterior.dataEnvio) !== chaveDia(m.dataEnvio)) {
      itens.push({ tipo: "dia", chave: `dia-${chaveDia(m.dataEnvio)}`, rotulo: rotuloDia(m.dataEnvio) });
    }
  });
  return itens;
}

function useAppAtivo(): boolean {
  const [ativo, setAtivo] = useState(AppState.currentState === "active");
  useEffect(() => {
    const assinatura = AppState.addEventListener("change", (estado) =>
      setAtivo(estado === "active"),
    );
    return () => assinatura.remove();
  }, []);
  return ativo;
}

/**
 * Telas 21 "Chat" e 22 "Chat somente leitura" da candidatura. Ao abrir,
 * carrega o chat, liga o canal em tempo real e marca as recebidas como lidas;
 * ao sair (ou com o app em segundo plano), desliga o canal.
 */
export function useChatViewModel(candidaturaId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const appAtivo = useAppAtivo();

  const query = useChatQuery(candidaturaId);
  const usuarioIdQuery = useUsuarioIdQuery();
  const usuarioId = usuarioIdQuery.data ?? null;

  const chat = query.data?.pages[0] ?? null;
  const chatId = chat?.id;
  const enviar = useEnviarMensagemMutation(chatId);
  const { mutate: marcarLidas } = useMarcarLidasMutation();

  const [texto, setTexto] = useState("");
  const [pendentes, setPendentes] = useState<MensagemPendente[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const contadorLocal = useRef(0);

  const mensagens = useMemo(
    () => query.data?.pages.flatMap((pagina) => pagina.historico.mensagens) ?? [],
    [query.data],
  );

  useCanalChat(appAtivo && chatId !== undefined, {
    aoEvento: (evento) => {
      if (evento.chatId !== chatId) {
        // Mensagem de outra conversa chegou ao aparelho.
        if (evento.tipo === TipoEventoChat.MENSAGEM_NOVA) {
          marcarEntregues(evento.chatId).catch(() => {});
        }
        return;
      }
      if (evento.tipo === TipoEventoChat.MENSAGEM_NOVA) {
        if (evento.mensagem) {
          inserirMensagemNoCache(queryClient, candidaturaId, evento.mensagem);
        }
        return;
      }
      if (evento.mensagemIds) {
        confirmarMensagensNoCache(
          queryClient,
          candidaturaId,
          evento.tipo,
          evento.mensagemIds,
          evento.em,
        );
      }
    },
    // O que chegou com o canal fora (queda, token vencido, segundo plano) está no histórico.
    aoConectar: () => void query.refetch(),
  });

  // Conversa na tela: as recebidas ainda não lidas viram lidas (vale também como entregue).
  const naoLidasRecebidas = useMemo(
    () =>
      usuarioId
        ? mensagens.filter((m) => m.remetenteId !== usuarioId && !m.lidaEm).map((m) => m.id)
        : [],
    [mensagens, usuarioId],
  );
  useEffect(() => {
    if (!appAtivo || !chatId || naoLidasRecebidas.length === 0) {
      return;
    }
    // Marca no cache antes: o efeito não repete a chamada enquanto ela não volta.
    confirmarMensagensNoCache(
      queryClient,
      candidaturaId,
      TipoEventoChat.LIDA,
      naoLidasRecebidas,
      new Date().toISOString(),
    );
    marcarLidas(chatId);
  }, [appAtivo, chatId, naoLidasRecebidas, queryClient, candidaturaId, marcarLidas]);

  function enviarPendente(pendente: MensagemPendente) {
    setPendentes((atuais) =>
      atuais.map((p) => (p.idLocal === pendente.idLocal ? { ...p, falhou: false } : p)),
    );
    // `mutateAsync`: os callbacks do `mutate` só valem para o último envio, e
    // várias mensagens podem estar no caminho ao mesmo tempo.
    enviar
      .mutateAsync(pendente.texto)
      .then((mensagem) => {
        inserirMensagemNoCache(queryClient, candidaturaId, mensagem);
        setPendentes((atuais) => atuais.filter((p) => p.idLocal !== pendente.idLocal));
      })
      .catch((falha) => {
        if (erroApi(falha)?.codigo === CodigoErro.CHAT_SOMENTE_LEITURA) {
          // O chat fechou enquanto a tela estava aberta: troca para a tela 22.
          setPendentes([]);
          void query.refetch();
          return;
        }
        setPendentes((atuais) =>
          atuais.map((p) => (p.idLocal === pendente.idLocal ? { ...p, falhou: true } : p)),
        );
      });
  }

  function aoEnviar() {
    const limpo = texto.trim();
    if (!limpo || !chatId) {
      return;
    }
    contadorLocal.current += 1;
    const pendente: MensagemPendente = {
      idLocal: `local-${contadorLocal.current}`,
      texto: limpo,
      dataEnvio: new Date().toISOString(),
      falhou: false,
    };
    setPendentes((atuais) => [...atuais, pendente]);
    setTexto("");
    enviarPendente(pendente);
  }

  function aoTentarDeNovo(idLocal: string) {
    const pendente = pendentes.find((p) => p.idLocal === idLocal);
    if (pendente) {
      enviarPendente(pendente);
    }
  }

  let erro: string | null = null;
  let podeTentarDeNovo = true;
  if (query.isError && !chat) {
    podeTentarDeNovo = erroApi(query.error)?.codigo !== CodigoErro.CHAT_NAO_ENCONTRADO;
    erro = podeTentarDeNovo
      ? mensagemErroApi(query.error, "Não foi possível carregar a conversa.")
      : "Esta conversa não está disponível.";
  }

  const somenteLeitura = chat?.isSomenteLeitura ?? false;
  // Quem vê é o Empregador quando a outra parte é o candidato.
  const souEmpregador = chat?.outraParte.papel === PapelNoChat.CANDIDATO;

  const cabecalho: CabecalhoChatExibido | null = chat
    ? {
        nome: chat.outraParte.nome,
        fotoUrl: chat.outraParte.fotoUrl,
        // Na tela 22 o título do anúncio diz de qual serviço é a conversa encerrada.
        subtitulo:
          souEmpregador && !somenteLeitura
            ? `Candidato · ${chat.anuncio.categoria}`
            : chat.anuncio.titulo,
        somenteLeitura,
      }
    : null;

  const itens = useMemo(
    () => montarItens(mensagens, pendentes, usuarioId),
    [mensagens, pendentes, usuarioId],
  );

  return {
    cabecalho,
    itens,
    carregando: query.isPending || usuarioIdQuery.isPending,
    erro,
    podeTentarDeNovo,
    recarregando: query.isRefetching,
    aoRecarregar: () => void query.refetch(),
    aoVoltar: () => router.back(),

    // Contato só é liberado depois da escolha.
    mostrarAvisoContato: !somenteLeitura && chat?.statusCandidatura === StatusAplicacao.ENVIADA,
    avisoSomenteLeitura:
      chat && somenteLeitura
        ? avisoSomenteLeitura(chat.motivoSomenteLeitura, chat.outraParte.papel, chat.outraParte.nome)
        : null,

    carregandoAnteriores: query.isFetchingNextPage,
    aoCarregarAnteriores: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },

    texto,
    textoMax: TEXTO_MENSAGEM_MAX,
    aoMudarTexto: setTexto,
    podeEnviar: texto.trim().length > 0 && !!chatId,
    aoEnviar,
    aoTentarDeNovo,
    // Foto no chat ainda não existe na API.
    aoCamera: () => mostrarToast(EM_BREVE),

    // "Escolher" abre a tela 23 (ETI-70); até lá, "Em breve".
    escolher:
      chat && souEmpregador && !somenteLeitura && chat.statusCandidatura === StatusAplicacao.ENVIADA
        ? { rotulo: `Escolher ${primeiroNome(chat.outraParte.nome)} para este serviço` }
        : null,
    aoEscolher: () => mostrarToast(EM_BREVE),

    // Menu "⋮" (tela 21b): perfil (ETI-106) e denúncia (ETI-115) ainda não existem.
    menuAberto,
    aoAbrirMenu: () => setMenuAberto(true),
    aoFecharMenu: () => setMenuAberto(false),
    aoVerPerfil: () => {
      setMenuAberto(false);
      mostrarToast(EM_BREVE);
    },
    aoDenunciar: () => {
      setMenuAberto(false);
      mostrarToast(EM_BREVE);
    },

    // Rodapé da tela 22: o Prestador volta ao mural; o Empregador, aos candidatos (22c).
    rotuloLinkSomenteLeitura: souEmpregador ? "Voltar para candidatos" : "Voltar para o mural",
    aoLinkSomenteLeitura: () => {
      if (souEmpregador) {
        router.back();
        return;
      }
      router.dismissTo("/(app)/(prestador)");
    },
  };
}

export type ChatViewModel = ReturnType<typeof useChatViewModel>;
