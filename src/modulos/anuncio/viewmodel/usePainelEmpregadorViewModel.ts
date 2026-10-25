import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

import { paraFusoLocal } from "../../../comum/lib/datas";
import { mensagemErroApi } from "../../../comum/lib/erros";
import type { Estado } from "../../../comum/tipos/api";
import { usePainelEmpregadorQuery } from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { AnuncioResumo } from "../tipos/anuncio.types";

// Os rótulos do protótipo ("Segunda", "Qua") não batem com o `EEEE` do ptBR ("segunda-feira").
const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

function quando(dataHoraUtc: string): string {
  const data = paraFusoLocal(dataHoraUtc);
  const hora = data.getMinutes() === 0 ? format(data, "HH'h'") : format(data, "HH'h'mm");
  return `${DIAS_SEMANA_CURTOS[data.getDay()]}, ${format(data, "dd/MM")} · ${hora}`;
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
    quando: quando(anuncio.dataHoraPretendida),
    bairro: anuncio.bairro,
    estado: estadoDoSelo(anuncio),
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
    aoPublicar: () => router.push("/(app)/(contratante)/novo"),
    aoVerHistorico: () => router.push("/(app)/(contratante)/anuncios"),
    aoAbrirAnuncio: (id: string) =>
      router.push({ pathname: "/(app)/(contratante)/anuncio/[id]", params: { id } }),
  };
}
