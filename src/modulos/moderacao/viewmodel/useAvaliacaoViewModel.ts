import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  MENSAGEM_JA_AVALIADO,
  MENSAGEM_NAO_CONCLUIDO,
  MENSAGEM_PRAZO_ENCERRADO,
  motivoSemAvaliacao,
  primeiroNome,
  rotuloNota,
  textoConcluido,
} from "../servico/avaliacao.helpers";
import { useAvaliacaoPendenteQuery, useAvaliarMutation } from "../servico/avaliacao.queries";
import { COMENTARIO_MAX } from "../tipos/avaliacao.types";

/**
 * Mensagem dos erros em que a avaliação não abre (tentar de novo não
 * adianta); `null` pros outros. `SERVICO_NAO_ENCONTRADO` é o 404 de quem não
 * é parte do serviço.
 */
function mensagemSemAvaliacao(erro: unknown): string | null {
  const resposta = erroApi(erro);
  switch (resposta?.codigo) {
    case CodigoErro.AVALIACAO_DUPLICADA:
      return MENSAGEM_JA_AVALIADO;
    case CodigoErro.JANELA_AVALIACAO_ENCERRADA:
      return MENSAGEM_PRAZO_ENCERRADO;
    case CodigoErro.SERVICO_NAO_CONCLUIDO:
      return MENSAGEM_NAO_CONCLUIDO;
    case CodigoErro.SERVICO_NAO_ENCONTRADO:
      return resposta.mensagem;
    default:
      return null;
  }
}

/**
 * Tela 45 "Avaliação" do serviço `anuncioId`. Sucesso e "Pular" voltam pra
 * tela de onde veio; "Pular" não chama a API (UC "Pular avaliação").
 */
export function useAvaliacaoViewModel(anuncioId: string) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useAvaliacaoPendenteQuery(anuncioId);
  const avaliar = useAvaliarMutation();
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [recusadaNoEnvio, setRecusadaNoEnvio] = useState<string | null>(null);

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const pendente = query.data;

  let semAvaliacao = recusadaNoEnvio;
  let erroCarregamento: string | null = null;
  if (!semAvaliacao && query.isError) {
    semAvaliacao = mensagemSemAvaliacao(query.error);
    if (!semAvaliacao) {
      erroCarregamento = mensagemErroApi(
        query.error,
        "Não foi possível carregar a avaliação.",
      );
    }
  } else if (!semAvaliacao && pendente && !pendente.podeAvaliar) {
    semAvaliacao = motivoSemAvaliacao(pendente);
  }

  const aoEnviar = async () => {
    if (nota === null) {
      return;
    }
    setErroEnvio(null);
    try {
      await avaliar.mutateAsync({
        anuncioId,
        request: { nota, comentario: comentario.trim() || null },
      });
      mostrarToast("Avaliação enviada");
      voltar();
    } catch (erro) {
      const recusada = mensagemSemAvaliacao(erro);
      if (recusada) {
        setRecusadaNoEnvio(recusada);
        return;
      }
      // COMENTARIO_SEM_NOTA, VALIDACAO_FALHOU: a mensagem da API já explica.
      setErroEnvio(
        mensagemErroApi(erro, "Não foi possível enviar a avaliação. Tente novamente."),
      );
    }
  };

  return {
    carregando: query.isPending && !recusadaNoEnvio,
    erroCarregamento,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    semAvaliacao,
    nome: pendente?.outraParte ? primeiroNome(pendente.outraParte.nome) : "",
    fotoUrl: pendente?.outraParte?.fotoUrl ?? null,
    /** "Instalar 3 tomadas · concluído hoje". */
    subtitulo: pendente?.servico.concluidoEm
      ? `${pendente.servico.titulo} · ${textoConcluido(pendente.servico.concluidoEm)}`
      : (pendente?.servico.titulo ?? ""),
    nota,
    rotuloNota: nota === null ? "Toque para dar a nota" : rotuloNota(nota),
    aoEscolherNota: (valor: number) => setNota(valor),
    comentario,
    aoMudarComentario: setComentario,
    comentarioMax: COMENTARIO_MAX,
    contador: `${comentario.length} / ${COMENTARIO_MAX}`,
    podeEnviar: nota !== null,
    enviando: avaliar.isPending,
    erroEnvio,
    aoEnviar: () => {
      void aoEnviar();
    },
    aoPular: voltar,
    aoVoltar: voltar,
  };
}
