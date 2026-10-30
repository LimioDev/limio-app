import { differenceInHours } from "date-fns";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { normalizarBusca } from "../../../comum/lib/busca";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  formatarDistancia,
  quandoCurto,
} from "../servico/anuncio.helpers";
import { useMuralQuery, useTotalMuralQuery } from "../servico/anuncio.queries";
import {
  OPCOES_QUANDO,
  QuandoMural,
  rotuloQuando,
} from "../tipos/anuncio.enums";
import type { AnuncioMural, FiltrosMural } from "../tipos/anuncio.types";

/** Selo "NOVO" nas primeiras 24 h de publicação. */
const HORAS_NOVO = 24;
/** Teto do controle de raio enquanto o perfil não carregou (mesmo máximo da tela 10). */
const RAIO_MAXIMO_PADRAO_KM = 40;
const RAIO_MINIMO_KM = 1;
/** Espera o arraste do raio parar antes de contar os serviços. */
const ESPERA_TOTAL_MS = 400;
/** Ao voltar pra aba, lista mais velha que isso é consultada de novo. */
const IDADE_MAXIMA_MS = 30_000;

const FILTROS_PADRAO: FiltrosMural = {
  categorias: [],
  raioKm: null,
  quando: QuandoMural.QUALQUER,
};

/** Dados do perfil de atuação que a rota traz do módulo `perfil`. */
export interface AtuacaoMural {
  categorias: { id: string; nome: string }[];
  especialidades: { id: string; nome: string }[];
  raioMaximoKm: number | null;
}

export interface CartaoMuralExibido {
  id: string;
  categoria: string;
  novo: boolean;
  titulo: string;
  nomeEmpregador: string;
  fotoEmpregadorUrl: string | null;
  /** "Qua, 03/09 · 14h". */
  quando: string;
  /** "Pinheiros · 1,8 km". */
  local: string;
  fotoUrl: string | null;
}

export interface AtalhoCategoria {
  /** `null` é o "Todas". */
  id: string | null;
  nome: string;
  selecionado: boolean;
}

/** Erro que troca a lista: o Prestador precisa agir antes de ver o mural. */
export interface BloqueioMural {
  mensagem: string;
  rotuloAcao: string;
  aoAcao: () => void;
}

export interface FolhaFiltrosExibida {
  aberta: boolean;
  /** "Elétrica, Hidráulica, Limpeza" ou "Todas as categorias". */
  resumoCategorias: string;
  /** "3 de 12 categorias". */
  contagemCategorias: string;
  categoriasExpandidas: boolean;
  categorias: { id: string; nome: string; selecionada: boolean }[];
  raioKm: number;
  raioMinimoKm: number;
  raioMaximoKm: number;
  quando: { valor: QuandoMural; rotulo: string; selecionado: boolean }[];
  /** "Ver 9 serviços". */
  rotuloVer: string;
}

function plural(total: number, singular: string, pluralTexto: string): string {
  return `${total} ${total === 1 ? singular : pluralTexto}`;
}

function cartaoParaExibicao(anuncio: AnuncioMural, agora: Date): CartaoMuralExibido {
  const distancia = formatarDistancia(anuncio.distanciaKm);
  return {
    id: anuncio.id,
    categoria: anuncio.categoria.nome,
    // Sem `publicadoEm` (ainda fora do contrato do ETI-73), o selo não aparece.
    novo: anuncio.publicadoEm
      ? differenceInHours(agora, new Date(anuncio.publicadoEm)) < HORAS_NOVO
      : false,
    titulo: anuncio.titulo,
    nomeEmpregador: anuncio.empregador.nomeExibicao,
    fotoEmpregadorUrl: anuncio.empregador.fotoUrl,
    quando: quandoCurto(anuncio.dataHoraPretendida),
    local: anuncio.bairroRegiao ? `${anuncio.bairroRegiao} · ${distancia}` : distancia,
    fotoUrl: anuncio.fotoUrl,
  };
}

/**
 * Tela 28 "Mural" com a folha de filtros (28a) e o estado vazio (29). A API
 * aplica a compatibilidade; o app só manda os filtros, que reduzem a lista.
 */
export function useMuralViewModel(atuacao: AtuacaoMural) {
  const router = useRouter();
  const [filtros, setFiltros] = useState<FiltrosMural>(FILTROS_PADRAO);
  const query = useMuralQuery(filtros);

  const [folhaAberta, setFolhaAberta] = useState(false);
  const [rascunho, setRascunho] = useState<FiltrosMural>(FILTROS_PADRAO);
  const [rascunhoContado, setRascunhoContado] = useState<FiltrosMural>(FILTROS_PADRAO);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState(false);
  const totalRascunho = useTotalMuralQuery(rascunhoContado, folhaAberta);

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const temporizador = setTimeout(() => setRascunhoContado(rascunho), ESPERA_TOTAL_MS);
    return () => clearTimeout(temporizador);
  }, [rascunho]);

  // A aba continua montada ao abrir o detalhe ou completar o perfil (tela 10).
  // Ao voltar, consulta de novo se a lista falhou ou envelheceu. O primeiro
  // foco é pulado porque o mount já consultou.
  // A situação fica num ref: como dependência, mudar de erro/envelhecer com a
  // tela em foco rodaria o efeito de novo e consultaria em laço.
  const { refetch } = query;
  const situacao = useRef({ erro: false, atualizadoEm: 0 });
  useEffect(() => {
    situacao.current = { erro: query.isError, atualizadoEm: query.dataUpdatedAt };
  }, [query.isError, query.dataUpdatedAt]);
  const primeiroFoco = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiroFoco.current) {
        primeiroFoco.current = false;
        return;
      }
      const { erro, atualizadoEm } = situacao.current;
      if (erro || Date.now() - atualizadoEm > IDADE_MAXIMA_MS) {
        void refetch();
      }
    }, [refetch]),
  );

  const raioMaximoKm = Math.max(
    atuacao.raioMaximoKm ?? RAIO_MAXIMO_PADRAO_KM,
    RAIO_MINIMO_KM,
  );

  const paginas = query.data?.pages ?? [];
  const total = paginas[0]?.totalElementos ?? 0;
  const agora = new Date();
  const termo = normalizarBusca(busca);
  const anuncios = paginas
    .flatMap((pagina) => pagina.content)
    // A lupa só procura no que já carregou; o contrato não tem busca por texto.
    .filter((anuncio) => !termo || normalizarBusca(anuncio.titulo).includes(termo))
    .map((anuncio) => cartaoParaExibicao(anuncio, agora));

  let bloqueio: BloqueioMural | null = null;
  let erro: string | null = null;
  if (query.isError && !query.data) {
    const codigo = erroApi(query.error)?.codigo;
    const mensagem = mensagemErroApi(query.error, "Não foi possível carregar o mural.");
    if (codigo === CodigoErro.PERFIL_INCOMPLETO) {
      bloqueio = {
        mensagem,
        rotuloAcao: "Completar perfil de atuação",
        aoAcao: () => router.push("/(app)/conta/atuacao"),
      };
    } else if (codigo === CodigoErro.CONTATOS_NAO_CONFIRMADOS) {
      bloqueio = {
        mensagem,
        rotuloAcao: "Confirmar telefone e e-mail",
        aoAcao: () => router.push("/(app)/conta/dados-contato"),
      };
    } else {
      erro = mensagem;
    }
  }

  const atalhos: AtalhoCategoria[] = [
    { id: null, nome: "Todas", selecionado: filtros.categorias.length === 0 },
    ...atuacao.especialidades.map((especialidade) => ({
      id: especialidade.id,
      nome: especialidade.nome,
      selecionado:
        filtros.categorias.length === 1 && filtros.categorias[0] === especialidade.id,
    })),
  ];

  const selecionadas = new Set(rascunho.categorias);
  const nomesSelecionados = atuacao.categorias
    .filter((categoria) => selecionadas.has(categoria.id))
    .map((categoria) => categoria.nome);
  const totalCategorias = atuacao.categorias.length;

  let rotuloVer = "Ver serviços";
  if (totalRascunho.data !== undefined) {
    rotuloVer = `Ver ${plural(totalRascunho.data, "serviço", "serviços")}`;
  }

  const folha: FolhaFiltrosExibida = {
    aberta: folhaAberta,
    resumoCategorias:
      nomesSelecionados.length > 0 ? nomesSelecionados.join(", ") : "Todas as categorias",
    contagemCategorias:
      nomesSelecionados.length > 0
        ? `${nomesSelecionados.length} de ${totalCategorias} categorias`
        : plural(totalCategorias, "categoria", "categorias"),
    categoriasExpandidas,
    categorias: atuacao.categorias.map((categoria) => ({
      ...categoria,
      selecionada: selecionadas.has(categoria.id),
    })),
    raioKm: Math.min(rascunho.raioKm ?? raioMaximoKm, raioMaximoKm),
    raioMinimoKm: RAIO_MINIMO_KM,
    raioMaximoKm,
    quando: OPCOES_QUANDO.map((valor) => ({
      valor,
      rotulo: rotuloQuando(valor),
      selecionado: rascunho.quando === valor,
    })),
    rotuloVer,
  };

  return {
    subtitulo:
      query.isSuccess && total > 0
        ? `${plural(total, "serviço", "serviços")} perto de você`
        : "Encontre novos serviços",
    atalhos,
    anuncios,
    carregando: query.isPending,
    bloqueio,
    erro,
    vazio: query.isSuccess && total === 0,
    // Vazio por categoria ou "Quando": raio não resolve, a ação é limpar os filtros.
    vazioPorFiltro:
      filtros.categorias.length > 0 || filtros.quando !== QuandoMural.QUALQUER,
    buscaSemResultado: query.isSuccess && total > 0 && anuncios.length === 0,
    carregandoMais: query.isFetchingNextPage,
    atualizando: query.isRefetching && !query.isFetchingNextPage,
    buscaAberta,
    busca,
    folha,
    aoAtualizar: () => void refetch(),
    aoFimDaLista: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
    aoEscolherAtalho: (id: string | null) =>
      setFiltros((atuais) => ({ ...atuais, categorias: id ? [id] : [] })),
    aoAbrirAnuncio: (id: string) =>
      router.push({ pathname: "/(app)/mural/[id]", params: { id } }),
    aoAlternarBusca: () => {
      setBuscaAberta((aberta) => !aberta);
      setBusca("");
    },
    aoBuscar: setBusca,
    // Com o raio filtrado, volta pro raio do perfil; já no raio do perfil, só
    // aumentando ele na tela 10, porque o filtro não passa do perfil.
    aoAumentarRaio: () => {
      if (filtros.raioKm !== null) {
        setFiltros((atuais) => ({ ...atuais, raioKm: null }));
      } else {
        router.push("/(app)/conta/atuacao");
      }
    },
    aoLimparFiltrosDoMural: () => setFiltros(FILTROS_PADRAO),
    aoAbrirFiltros: () => {
      setRascunho(filtros);
      setRascunhoContado(filtros);
      setCategoriasExpandidas(false);
      setFolhaAberta(true);
    },
    aoFecharFiltros: () => setFolhaAberta(false),
    aoLimparFiltros: () => setRascunho(FILTROS_PADRAO),
    aoAplicarFiltros: () => {
      setFiltros(rascunho);
      setFolhaAberta(false);
    },
    aoExpandirCategorias: () => setCategoriasExpandidas((expandidas) => !expandidas),
    aoAlternarCategoria: (id: string) =>
      setRascunho((atual) => ({
        ...atual,
        categorias: atual.categorias.includes(id)
          ? atual.categorias.filter((categoria) => categoria !== id)
          : [...atual.categorias, id],
      })),
    // O máximo é o raio do perfil, que a API já aplica: vai como "sem filtro".
    aoMudarRaio: (km: number) =>
      setRascunho((atual) => ({ ...atual, raioKm: km >= raioMaximoKm ? null : km })),
    aoEscolherQuando: (quando: QuandoMural) =>
      setRascunho((atual) => ({ ...atual, quando })),
  };
}

export type MuralViewModel = ReturnType<typeof useMuralViewModel>;
