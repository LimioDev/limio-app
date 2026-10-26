import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

import { paraFusoLocal } from "../../../comum/lib/datas";
import { mensagemErroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import { estadoDoAnuncio, quandoCurto } from "../servico/anuncio.helpers";
import { usePainelEmpregadorQuery } from "../servico/anuncio.queries";
import type { AnuncioResumo } from "../tipos/anuncio.types";

// Os rótulos do protótipo ("Segunda") não batem com o `EEEE` do ptBR ("segunda-feira").
const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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

export interface PainelExibido {
  nomeExibicao: string;
  /** Saudação "Olá, Marina" usa só o primeiro nome. */
  primeiroNome: string;
  fotoUrl: string | null;
  anunciosAbertos: number;
  novosCandidatos: number;
  anuncios: AnuncioExibido[];
}

/** "Segunda, 31 de agosto", no fuso do sistema. */
function dataDoDia(agora: Date): string {
  const hoje = paraFusoLocal(agora);
  return `${DIAS_SEMANA[hoje.getDay()]}, ${format(hoje, "d 'de' MMMM", { locale: ptBR })}`;
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
    estado: estadoDoAnuncio(anuncio.status, anuncio.prestadorEscolhido !== null),
    rodape: rodape(anuncio),
  };
}

export function usePainelEmpregadorViewModel() {
  const router = useRouter();
  const query = usePainelEmpregadorQuery();

  const painel: PainelExibido | null = query.data
    ? {
        ...query.data,
        primeiroNome: query.data.nomeExibicao.trim().split(/\s+/)[0],
        anuncios: query.data.anuncios.map(anuncioParaExibicao),
      }
    : null;

  return {
    dataDoDia: dataDoDia(new Date()),
    painel,
    carregando: query.isPending,
    erro: query.isError
      ? mensagemErroApi(query.error, "Não foi possível carregar seus anúncios.")
      : null,
    atualizando: query.isRefetching,
    aoAtualizar: () => void query.refetch(),
    aoAbrirNotificacoes: () => router.push("/(app)/notificacoes"),
    aoPublicar: () => router.push("/(app)/anuncio/novo"),
    aoVerHistorico: () => router.push("/(app)/(contratante)/anuncios"),
    aoAbrirAnuncio: (id: string) =>
      router.push({ pathname: "/(app)/anuncio/[id]", params: { id } }),
  };
}
