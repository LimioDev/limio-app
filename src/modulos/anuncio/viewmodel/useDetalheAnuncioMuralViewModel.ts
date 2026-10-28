import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { rotuloMunicipio } from "../../../comum/tipos/localidade";
import {
  diaComData,
  formatarDistancia,
  horaPretendida,
} from "../servico/anuncio.helpers";
import {
  useCandidatarMutation,
  useDetalheAnuncioMuralQuery,
} from "../servico/anuncio.queries";
import { StatusAplicacao } from "../tipos/anuncio.enums";
import type { DetalheAnuncioMural } from "../tipos/anuncio.types";

export interface SituacaoCandidaturaExibida {
  /** Abre o chat 1:1 da candidatura (tela 21). */
  aplicacaoId: string;
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

export interface FolhaCandidatarExibida {
  aberta: boolean;
  /** Primeiro nome do Empregador, usado nos itens da folha. */
  empregador: string;
  /** "Confirmar candidatura" em andamento: botões travados e a folha não fecha. */
  enviando: boolean;
  /** `atalho` é o rótulo do link (só em contatos não confirmados). */
  erro: { mensagem: string; atalho: string | null } | null;
}

/** "Marina B." → "Marina", como o protótipo usa nos textos corridos. */
function primeiroNome(nomeExibicao: string): string {
  return nomeExibicao.trim().split(/\s+/)[0] ?? nomeExibicao;
}

/** `null` quando o Prestador pode se candidatar de novo (anterior recusada ou encerrada). */
function situacaoCandidatura(
  candidatura: NonNullable<DetalheAnuncioMural["minhaCandidatura"]>,
  empregador: string,
): SituacaoCandidaturaExibida | null {
  const aplicacaoId = candidatura.id;
  switch (candidatura.status) {
    case StatusAplicacao.ENVIADA:
      return {
        aplicacaoId,
        titulo: "Candidatura enviada",
        descricao: `Converse com ${empregador} no chat para combinar escopo e valor.`,
      };
    case StatusAplicacao.ESCOLHIDA:
    case StatusAplicacao.AGUARDANDO_VALIDACAO:
    case StatusAplicacao.CONCLUIDA:
      return {
        aplicacaoId,
        titulo: "Você foi escolhido",
        descricao: `Combine os detalhes do serviço com ${empregador} pelo chat.`,
      };
    case StatusAplicacao.RECUSADA:
    case StatusAplicacao.ENCERRADA:
      return null;
  }
}

/** "São Paulo · SP"; só a parte que veio quando falta cidade ou UF (anúncio antigo). */
function rotuloCidadeUf({ cidade, uf }: DetalheAnuncioMural): string {
  if (cidade && uf) {
    return rotuloMunicipio(cidade, uf);
  }
  return cidade ?? uf ?? "";
}

function detalheParaExibicao(anuncio: DetalheAnuncioMural): DetalheMuralExibido {
  const { empregador } = anuncio;
  const cidadeUf = rotuloCidadeUf(anuncio);
  return {
    // Foto sem link (storage fora do ar) fica de fora do carrossel.
    fotos: anuncio.fotos.flatMap((foto) => (foto.url ? [foto.url] : [])),
    categoria: anuncio.categoria.nome,
    distancia: `${formatarDistancia(anuncio.distanciaKm)} de você`,
    titulo: anuncio.titulo,
    dia: diaComData(anuncio.dataHoraPretendida),
    hora: horaPretendida(anuncio.dataHoraPretendida),
    local: anuncio.bairroRegiao ?? anuncio.cidade ?? cidadeUf,
    cidadeUf,
    descricao: anuncio.descricao,
    empregador: {
      nome: empregador.nomeExibicao,
      fotoUrl: empregador.fotoUrl,
      reputacao:
        empregador.mediaAvaliacoes !== null && empregador.qtdAvaliacoes > 0
          ? { nota: empregador.mediaAvaliacoes, totalAvaliacoes: empregador.qtdAvaliacoes }
          : null,
    },
    candidatura: anuncio.minhaCandidatura
      ? situacaoCandidatura(anuncio.minhaCandidatura, primeiroNome(empregador.nomeExibicao))
      : null,
  };
}

/** Tela 30 "Detalhe do anúncio" vista pelo Prestador, aberta pelo mural. */
export function useDetalheAnuncioMuralViewModel(id: string) {
  const router = useRouter();
  const query = useDetalheAnuncioMuralQuery(id);
  const [fotoAtual, setFotoAtual] = useState(0);
  const candidatar = useCandidatarMutation(id);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [erroFolha, setErroFolha] = useState<FolhaCandidatarExibida["erro"]>(null);
  const mostrarToast = useToast((estado) => estado.mostrar);

  let erro: string | null = null;
  // Anúncio que saiu do mural não volta com "Tentar de novo".
  let podeTentarDeNovo = true;
  if (query.isError && !query.data) {
    podeTentarDeNovo = erroApi(query.error)?.codigo !== CodigoErro.ANUNCIO_NAO_ENCONTRADO;
    erro = podeTentarDeNovo
      ? mensagemErroApi(query.error, "Não foi possível carregar o anúncio.")
      : "Este anúncio não está mais disponível no mural.";
  }

  const anuncio = query.data ? detalheParaExibicao(query.data) : null;

  function fecharFolha() {
    setFolhaAberta(false);
    setErroFolha(null);
  }

  // A cota não é conferida aqui: quem decide é a API (ETI-75).
  function confirmarCandidatura() {
    setErroFolha(null);
    candidatar.mutate(undefined, {
      onSuccess: fecharFolha,
      onError: (falha) => {
        switch (erroApi(falha)?.codigo) {
          case CodigoErro.COTA_ESGOTADA:
            fecharFolha();
            router.push("/(app)/(prestador)/cota");
            return;
          case CodigoErro.ANUNCIO_ESTADO_INVALIDO:
            fecharFolha();
            mostrarToast("Este anúncio não aceita mais candidaturas", TipoToast.ERRO);
            router.back();
            return;
          case CodigoErro.CANDIDATURA_DUPLICADA:
            setErroFolha({ mensagem: "Você já se candidatou a este serviço.", atalho: null });
            return;
          case CodigoErro.CONTATOS_NAO_CONFIRMADOS:
            setErroFolha({
              mensagem: "Confirme seu telefone e e-mail para se candidatar.",
              atalho: "Confirmar telefone e e-mail",
            });
            return;
          default:
            setErroFolha({
              mensagem: mensagemErroApi(falha, "Não foi possível enviar sua candidatura."),
              atalho: null,
            });
        }
      },
    });
  }

  const folha: FolhaCandidatarExibida = {
    aberta: folhaAberta,
    empregador: query.data ? primeiroNome(query.data.empregador.nomeExibicao) : "",
    enviando: candidatar.isPending,
    erro: erroFolha,
  };

  return {
    anuncio,
    carregando: query.isPending,
    erro,
    podeTentarDeNovo,
    atualizando: query.isRefetching,
    fotoAtual,
    aoMudarFoto: setFotoAtual,
    aoTentarDeNovo: () => void query.refetch(),
    aoVoltar: () => router.back(),
    aoAbrirChat: (aplicacaoId: string) =>
      router.push({ pathname: "/(app)/chat/[aplicacaoId]", params: { aplicacaoId } }),
    folha,
    aoCandidatar: () => setFolhaAberta(true),
    aoConfirmarCandidatura: confirmarCandidatura,
    aoFecharFolha: fecharFolha,
    // Único atalho da folha: contatos não confirmados.
    aoAtalhoErroFolha: () => {
      fecharFolha();
      router.push("/(app)/conta/dados-contato");
    },
    // "Ver perfil" chega com o ETI-106; até lá, o link fica escondido.
    aoVerPerfilEmpregador: undefined as (() => void) | undefined,
  };
}
