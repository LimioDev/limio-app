import { useRouter } from "expo-router";
import { useEffect } from "react";

import { paraFusoLocal } from "../../../comum/lib/datas";
import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { chaveCacheFoto } from "../../../comum/lib/foto";
import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { ehPapelDoApp, PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { usePerfilPublicoQuery } from "../servico/perfilPublico.queries";
import type { AvaliacaoRecente, PerfilPublico } from "../tipos/perfilPublico.types";

const PERFIL_NAO_ENCONTRADO = "Este perfil não existe mais.";

/** Parâmetros da rota `perfil/[usuarioId]`. */
export interface ParametrosPerfilPublico {
  usuarioId: string;
  /** Qual perfil da pessoa: `EMPREGADOR` ou `PRESTADOR`. */
  papel?: string;
  /**
   * Candidatura `ENVIADA` de quem abriu pela tela 18: só com ela a tela vira
   * a 20a, com "Conversar" e "Escolher".
   */
  candidaturaId?: string;
  /** Anúncio da candidatura: o "Escolher" abre a tela 23 com ele. */
  anuncioId?: string;
  /**
   * `"chat"` quando vem do menu "⋮" do chat: quem abriu já está conversando
   * com a pessoa, então o aviso da 20b não aparece.
   */
  origem?: string;
}

export interface AvaliacaoExibida {
  chave: string;
  nome: string;
  nota: number;
  /** "12/08"; com o ano quando não é o ano corrente. */
  data: string;
  comentario: string | null;
}

export interface PerfilPublicoExibido {
  nome: string;
  fotoUrl: string | null;
  fotoCacheKey: string | null;
  /** `null` sem avaliação: a tela mostra "Sem avaliações ainda", nunca 0,0. */
  reputacao: { nota: number; totalAvaliacoes: number } | null;
  /** "23 avaliações · 31 serviços concluídos"; sem avaliação, só os serviços. */
  resumo: string;
  especialidades: string[];
  servicosConcluidos: number;
  /** "serviço concluído" / "serviços concluídos", embaixo do número. */
  rotuloServicos: string;
  avaliacoes: number;
  rotuloAvaliacoes: string;
  avaliacoesRecentes: AvaliacaoExibida[];
}

function plural(quantidade: number, singular: string, varios: string): string {
  return quantidade === 1 ? singular : varios;
}

function dataDaAvaliacao(dataUtc: string, agora = new Date()): string {
  const data = paraFusoLocal(dataUtc);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return data.getFullYear() === paraFusoLocal(agora).getFullYear()
    ? `${dia}/${mes}`
    : `${dia}/${mes}/${data.getFullYear()}`;
}

function avaliacaoParaExibicao(avaliacao: AvaliacaoRecente, indice: number): AvaliacaoExibida {
  return {
    // A API não manda id da avaliação: a posição + a data distinguem na lista.
    chave: `${indice}-${avaliacao.data}`,
    nome: avaliacao.avaliadorNome,
    nota: avaliacao.nota,
    data: dataDaAvaliacao(avaliacao.data),
    comentario: avaliacao.comentario?.trim() ? avaliacao.comentario.trim() : null,
  };
}

export function perfilParaExibicao(perfil: PerfilPublico): PerfilPublicoExibido {
  const temAvaliacao = perfil.mediaAvaliacoes !== null && perfil.qtdAvaliacoes > 0;
  const textoServicos = `${perfil.servicosConcluidos} ${plural(perfil.servicosConcluidos, "serviço concluído", "serviços concluídos")}`;
  const textoAvaliacoes = `${perfil.qtdAvaliacoes} ${plural(perfil.qtdAvaliacoes, "avaliação", "avaliações")}`;

  return {
    nome: perfil.nomeExibicao,
    fotoUrl: perfil.fotoUrl,
    fotoCacheKey: perfil.fotoUrl ? chaveCacheFoto(perfil.fotoUrl) : null,
    reputacao: temAvaliacao
      ? { nota: perfil.mediaAvaliacoes as number, totalAvaliacoes: perfil.qtdAvaliacoes }
      : null,
    resumo: temAvaliacao ? `${textoAvaliacoes} · ${textoServicos}` : textoServicos,
    especialidades: perfil.especialidades,
    servicosConcluidos: perfil.servicosConcluidos,
    rotuloServicos: plural(perfil.servicosConcluidos, "serviço concluído", "serviços concluídos"),
    avaliacoes: perfil.qtdAvaliacoes,
    rotuloAvaliacoes: plural(perfil.qtdAvaliacoes, "avaliação", "avaliações"),
    avaliacoesRecentes: perfil.avaliacoesRecentes.map(avaliacaoParaExibicao),
  };
}

/**
 * Telas 20a "Perfil público do candidato" e 20b "Perfil público (consulta)"
 * (ETI-106). A 20a só aparece quando o Empregador chega pela lista de
 * candidatos (tela 18), que só traz candidaturas `ENVIADA`; de qualquer outro
 * ponto (mural, chat) é a 20b, sem ações.
 */
export function usePerfilPublicoViewModel({
  usuarioId,
  papel: papelDaRota,
  candidaturaId,
  anuncioId,
  origem,
}: ParametrosPerfilPublico) {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const meuUsuarioId = useSessao((estado) => estado.usuarioId);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const papel: PapelDoApp | null = papelDaRota && ehPapelDoApp(papelDaRota) ? papelDaRota : null;
  const query = usePerfilPublicoQuery(usuarioId, papel);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  // PERFIL_NAO_ENCONTRADO (ou rota sem papel): avisa e volta pra tela anterior.
  const naoEncontrado =
    papel === null || erroApi(query.error)?.codigo === CodigoErro.PERFIL_NAO_ENCONTRADO;
  useEffect(() => {
    if (naoEncontrado) {
      mostrarToast(PERFIL_NAO_ENCONTRADO, TipoToast.ERRO);
      voltar();
    }
    // `voltar` e `mostrarToast` não mudam o efeito: só a chegada do 404 dispara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naoEncontrado]);

  const erro =
    query.isError && !query.data && !naoEncontrado
      ? mensagemErroApi(query.error, "Não foi possível carregar o perfil.")
      : null;

  // 20a: Empregador vendo um candidato do próprio anúncio.
  const comoCandidato =
    !!candidaturaId &&
    papel === PapelUsuario.PRESTADOR &&
    papelAtivo === PapelUsuario.EMPREGADOR;

  return {
    // O 404 já está saindo da tela: segura no "carregando" em vez de piscar o erro.
    carregando: query.isPending || naoEncontrado,
    erro,
    aoTentarDeNovo: () => void query.refetch(),
    atualizando: query.isRefetching,
    aoAtualizar: () => void query.refetch(),
    perfil: query.data ? perfilParaExibicao(query.data) : null,
    aoVoltar: voltar,
    // Bandeira: tela 46 (ETI-115) com a denúncia do perfil. Sem ela no próprio
    // perfil (a API recusa) e antes de carregar (o card precisa do nome).
    aoDenunciar:
      query.data && papel && usuarioId !== meuUsuarioId
        ? () =>
            router.push({
              pathname: "/(app)/denuncia",
              params: {
                denunciadoId: usuarioId,
                titulo: query.data.nomeExibicao,
                detalhe:
                  papel === PapelUsuario.PRESTADOR ? "Perfil de Prestador" : "Perfil de Empregador",
              },
            })
        : undefined,
    acoes: comoCandidato
      ? {
          // O chat da tela 21 é aberto pela candidatura, como na tela 18. O
          // anúncio vai junto: o "Escolher" do chat abre a tela 23 com ele.
          aoConversar: () =>
            router.push({
              pathname: "/(app)/chat/[aplicacaoId]",
              params: anuncioId
                ? { aplicacaoId: candidaturaId, anuncioId }
                : { aplicacaoId: candidaturaId },
            }),
          // Tela 23 "Escolher (nome)?" (ETI-70), por cima desta tela.
          aoEscolher: anuncioId
            ? () =>
                router.push({
                  pathname: "/(app)/escolher-prestador",
                  params: { anuncioId, candidaturaId },
                })
            : undefined,
        }
      : null,
    // O aviso da 20b só faz sentido pra quem tem anúncio: o Empregador vendo um
    // Prestador. Pelo chat não: a pessoa é candidata e ele acabou de sair da conversa.
    mostrarAvisoConsulta:
      !comoCandidato &&
      origem !== "chat" &&
      papel === PapelUsuario.PRESTADOR &&
      papelAtivo === PapelUsuario.EMPREGADOR,
  };
}

export type PerfilPublicoViewModel = ReturnType<typeof usePerfilPublicoViewModel>;
