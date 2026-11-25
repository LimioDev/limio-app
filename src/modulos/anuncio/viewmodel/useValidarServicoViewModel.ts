import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { Estado } from "../../../comum/tipos/api";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  detalheServicoParaDenuncia,
  diaEHoraDoCheckout,
  estadoDoAnuncio,
  primeiroNome,
} from "../servico/anuncio.helpers";
import {
  useServicoQuery,
  useValidacaoQuery,
  useValidarServicoMutation,
} from "../servico/anuncio.queries";
import { ModoValidacao, rotuloModoValidacao, StatusAnuncio } from "../tipos/anuncio.enums";

/** Foto do check-out; `url` `null` quando o storage não respondeu (fica o desenho). */
export interface FotoCheckoutExibida {
  chave: string;
  url: string | null;
}

export interface ValidacaoExibida {
  estado: Estado;
  /** "Rafael finalizou e enviou a evidência." ou "Você viu o serviço pronto no local?". */
  titulo: string;
  /** "Hoje às 16:38" ou "Rafael ainda não enviou o check-out.". */
  subtitulo: string;
  /** Só com check-out (tela 27); sem ele (27b) a área da foto não aparece. */
  comCheckout: boolean;
  fotos: FotoCheckoutExibida[];
  /**
   * "Como você quer validar?": "Pela foto" com check-out e "Vi no local" sem
   * ele. A API só aceita um modo por status (ETI-92), então não há escolha.
   */
  modo: string;
  /** Sem check-out: "\"Pela foto\" fica disponível quando Rafael enviar o check-out." */
  dicaModo: string | null;
}

const MENSAGEM_NAO_DISPONIVEL = "Este serviço não está disponível.";
const MENSAGEM_JA_VALIDADO = "Este serviço não pode mais ser validado.";
// Texto do card (ETI-93).
const MENSAGEM_SEM_CHECKOUT =
  "O prestador ainda não enviou a foto. Valide só se viu o serviço no local.";

function maiusculaInicial(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Só dá pra validar com o Prestador escolhido e antes da conclusão (ETI-92). */
function aceitaValidacao(status: StatusAnuncio): boolean {
  switch (status) {
    case StatusAnuncio.PUBLICADO:
    case StatusAnuncio.EM_ANDAMENTO:
    case StatusAnuncio.AGUARDANDO_VALIDACAO:
      return true;
    case StatusAnuncio.CONCLUIDO:
    case StatusAnuncio.ENCERRADO:
      return false;
  }
}

/**
 * Tela 27 "Validar serviço" do Empregador (ETI-93), aberta pela tela 25. O
 * status vem do "Consultar serviço" (já em cache pela tela 25); as fotos e a
 * hora do check-out, do "Consultar validação". O modo segue o status, como a
 * API exige (ETI-92): "Pela foto" em `AGUARDANDO_VALIDACAO` e "Vi no local"
 * antes do check-out (27b). O protótipo oferece os dois depois do check-out,
 * mas a API recusa o presencial ali. No sucesso troca pela tela 45
 * "Avaliação", que volta pra tela 25 já concluída.
 */
export function useValidarServicoViewModel(anuncioId: string) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const servicoQuery = useServicoQuery(anuncioId);
  const validacaoQuery = useValidacaoQuery(anuncioId);
  const validar = useValidarServicoMutation(anuncioId);

  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // Trava síncrona do "Validar serviço": `isPending` só muda no próximo
  // render, e um toque duplo mandaria dois POSTs (o segundo volta 409).
  const enviando = useRef(false);

  // A tela já saiu (voltar ou desmontou): o fim do envio não navega de novo,
  // senão tiraria também a tela 25 de baixo.
  const encerrada = useRef(false);
  useEffect(() => {
    encerrada.current = false;
    return () => {
      encerrada.current = true;
    };
  }, []);

  /** Volta pra tela 25; aberta sem ela embaixo (link direto), troca por ela. */
  const voltarAoServico = () => {
    if (encerrada.current) {
      return;
    }
    encerrada.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/(app)/servico/combinado/[id]", params: { id: anuncioId } });
    }
  };

  const sairComAviso = (mensagem: string) => {
    mostrarToast(mensagem, TipoToast.ERRO);
    voltarAoServico();
  };

  const naoDisponivel = [servicoQuery.error, validacaoQuery.error].some(
    (falha) => erroApi(falha)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO,
  );
  const servico = naoDisponivel ? undefined : servicoQuery.data;
  const consulta = naoDisponivel ? undefined : validacaoQuery.data;

  // Depois do sucesso a tela 25 já recebeu "Concluído": a tela 27 continua
  // igual até a troca pela Avaliação, em vez de piscar o "não pode mais".
  const jaValidado =
    !validar.isSuccess && servico !== undefined && !aceitaValidacao(servico.status);

  let erro: string | null = null;
  if (naoDisponivel) {
    erro = MENSAGEM_NAO_DISPONIVEL;
  } else if (jaValidado) {
    erro = MENSAGEM_JA_VALIDADO;
  } else if (servicoQuery.isError && !servico) {
    erro = mensagemErroApi(servicoQuery.error, "Não foi possível carregar o serviço.");
  } else if (validacaoQuery.isError && !consulta) {
    erro = mensagemErroApi(validacaoQuery.error, "Não foi possível carregar a validação.");
  }

  // "Pela foto" só em `AGUARDANDO_VALIDACAO`; "Vi no local" só antes (ETI-92).
  const comCheckout = servico?.status === StatusAnuncio.AGUARDANDO_VALIDACAO;
  const modo: ModoValidacao = comCheckout ? ModoValidacao.PELA_FOTO : ModoValidacao.PRESENCIAL;

  const nomeCompleto = consulta?.nomePrestador ?? servico?.outraParte.nome ?? null;
  const nome = nomeCompleto ? primeiroNome(nomeCompleto) : "o Prestador";

  let validacao: ValidacaoExibida | null = null;
  if (servico && consulta && erro === null) {
    validacao = {
      // Sempre há Prestador escolhido aqui: `PUBLICADO` é o "Combinado".
      estado: estadoDoAnuncio(servico.status, true),
      titulo: comCheckout
        ? `${maiusculaInicial(nome)} finalizou e enviou a evidência.`
        : "Você viu o serviço pronto no local?",
      subtitulo:
        comCheckout && consulta.checkoutEm
          ? diaEHoraDoCheckout(consulta.checkoutEm)
          : `${maiusculaInicial(nome)} ainda não enviou o check-out.`,
      comCheckout,
      fotos: consulta.fotosCheckout.map((foto) => ({ chave: foto.id, url: foto.url })),
      modo: rotuloModoValidacao(modo),
      dicaModo: comCheckout
        ? null
        : `"Pela foto" fica disponível quando ${nome} enviar o check-out.`,
    };
  }

  const aoValidar = () => {
    if (enviando.current || !validacao) {
      return;
    }
    enviando.current = true;
    setErroEnvio(null);
    validar.mutate(modo, {
      onSuccess: () => {
        // A trava fica: a tela está saindo.
        if (encerrada.current) {
          return;
        }
        encerrada.current = true;
        mostrarToast("Serviço validado.", TipoToast.SUCESSO);
        // Troca em vez de empilhar: o voltar da Avaliação cai na tela 25.
        router.replace({ pathname: "/(app)/avaliacao/[anuncioId]", params: { anuncioId } });
      },
      onError: async (falha) => {
        switch (erroApi(falha)?.codigo) {
          // Defesa pra cache desatualizado: o status não volta de
          // `AGUARDANDO_VALIDACAO`, mas se a tela abriu com um status velho a
          // consulta do serviço recarrega (mutation) e ela passa pra "Vi no local".
          case CodigoErro.VALIDACAO_SEM_CHECKOUT:
            enviando.current = false;
            setErroEnvio(MENSAGEM_SEM_CHECKOUT);
            return;
          case CodigoErro.SERVICO_ESTADO_INVALIDO: {
            // O check-out chegou com a tela aberta em "Vi no local": a API
            // recusa o presencial, mas ainda dá pra validar pela foto. A trava
            // fica até a consulta voltar, senão um novo toque manda outro 409.
            const [{ data: atual }] = await Promise.all([
              servicoQuery.refetch(),
              validacaoQuery.refetch(),
            ]);
            enviando.current = false;
            if (atual?.status === StatusAnuncio.AGUARDANDO_VALIDACAO) {
              setErroEnvio(
                `${maiusculaInicial(nome)} acabou de enviar o check-out. Confira a foto e valide.`,
              );
              return;
            }
            // Já concluído ou cancelado entre abrir a tela e validar.
            sairComAviso(MENSAGEM_JA_VALIDADO);
            return;
          }
          case CodigoErro.SERVICO_NAO_ENCONTRADO:
            enviando.current = false;
            sairComAviso("Este serviço não está mais disponível.");
            return;
          default:
            enviando.current = false;
            setErroEnvio(mensagemErroApi(falha, "Não foi possível validar o serviço."));
        }
      },
    });
  };

  return {
    validacao,
    carregando: erro === null && (servicoQuery.isPending || validacaoQuery.isPending),
    erro,
    // Não disponível ou já validado: mensagem e volta, sem "Tentar de novo".
    podeTentarDeNovo: !naoDisponivel && !jaValidado,
    tentandoDeNovo: servicoQuery.isRefetching || validacaoQuery.isRefetching,
    aoTentarDeNovo: () => {
      if (servicoQuery.isError) void servicoQuery.refetch();
      if (validacaoQuery.isError) void validacaoQuery.refetch();
    },
    enviando: validar.isPending,
    erroEnvio,
    aoValidar,
    aoVoltar: () => {
      if (!validar.isPending) {
        voltarAoServico();
      }
    },
    // "Algo deu errado? Abrir denúncia": tela 46 (ETI-115) contra o Prestador
    // escolhido, pelo serviço. Por cima desta tela: o voltar cai aqui.
    aoDenunciar: () => {
      if (!servico || validar.isPending) {
        return;
      }
      router.push({
        pathname: "/(app)/denuncia",
        params: {
          anuncioId,
          titulo: servico.titulo,
          detalhe: detalheServicoParaDenuncia(servico),
        },
      });
    },
  };
}
