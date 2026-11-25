import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import {
  formatarPreco,
  rotuloCartao,
  textoDiaCobranca,
} from "../servico/gold.helpers";
import { useAssinarGoldMutation, usePlanoGoldQuery } from "../servico/gold.queries";
import { sufixoCiclo } from "../tipos/gold.enums";
import type { PlanoGoldResponse } from "../tipos/gold.types";

export interface CartaoExibido {
  /** "Visa •••• 4419". */
  rotulo: string;
  /** "Cobrança todo dia 18". */
  cobranca: string;
}

export interface PlanoGoldExibido {
  /** "R$ 29,90". */
  preco: string;
  /** "/mês"; vazio pra ciclo que o app não conhece. */
  ciclo: string;
  /** `null` sem cartão salvo. */
  cartao: CartaoExibido | null;
}

const MENSAGEM_TROCA_EM_BREVE = "A troca de cartão pelo app chega em breve.";

function planoParaExibicao(plano: PlanoGoldResponse): PlanoGoldExibido {
  return {
    preco: formatarPreco(plano.precoCentavos, plano.moeda),
    ciclo: sufixoCiclo(plano.ciclo),
    cartao: plano.cartaoSalvo
      ? { rotulo: rotuloCartao(plano.cartaoSalvo), cobranca: textoDiaCobranca() }
      : null,
  };
}

/**
 * Tela 34 "Assinatura" (ETI-82): o que o GOLD oferece e o "Assinar GOLD", que
 * cobra no cartão salvo. Chega-se pelo "Ver GOLD" da faixa do mural e pelo
 * "Conhecer o GOLD" da tela 33. No sucesso (e se o GOLD já estiver ativo)
 * troca pela tela 35 "Assinatura GOLD".
 */
export function useAssinarGoldViewModel() {
  const router = useRouter();
  const navigation = useNavigation();
  const mostrarToast = useToast((estado) => estado.mostrar);
  // O card pede consultar ao abrir: preço e cartão podem ter mudado.
  const query = usePlanoGoldQuery({ sempreAoAbrir: true });
  const assinar = useAssinarGoldMutation();

  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  /** `PAGAMENTO_RECUSADO`: oferece trocar o cartão junto da mensagem. */
  const [recusado, setRecusado] = useState(false);
  const [avisoCartao, setAvisoCartao] = useState<string | null>(null);
  // Trava desde o toque: `isPending` só muda no próximo render, e um toque
  // duplo mandaria duas cobranças.
  const enviando = useRef(false);

  const pendente = assinar.isPending;

  // Durante a cobrança o gesto de voltar do iOS fica desligado: se a tela
  // saísse, os callbacks do `mutate` não rodariam (sem toast nem tela 35).
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !pendente });
  }, [navigation, pendente]);

  // Durante a cobrança o voltar do Android não fecha a tela: o resultado
  // ainda decide pra onde ir.
  useEffect(() => {
    if (!pendente) {
      return;
    }
    const assinatura = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => assinatura.remove();
  }, [pendente]);

  const plano = query.data;

  /** Troca em vez de empilhar: o voltar da tela 35 cai em quem abriu a 34. */
  const abrirAssinaturaAtiva = (renovaEm?: string) => {
    router.replace({
      pathname: "/(app)/conta/assinatura-gold",
      params: renovaEm ? { renovaEm } : {},
    });
  };

  const aoAssinar = () => {
    if (enviando.current || !plano?.cartaoSalvo || pendente) {
      return;
    }
    enviando.current = true;
    setErroEnvio(null);
    setRecusado(false);
    setAvisoCartao(null);
    assinar.mutate(
      { codigoPlano: plano.codigoPlano },
      {
        onSuccess: (assinatura) => {
          // A trava fica: a tela está saindo.
          mostrarToast("GOLD ativo! Suas escolhas agora são ilimitadas.", TipoToast.SUCESSO);
          abrirAssinaturaAtiva(assinatura.renovaEm);
        },
        onError: (falha) => {
          switch (erroApi(falha)?.codigo) {
            // Assinou por outro aparelho ou a tela abriu com o cache velho.
            case CodigoErro.ASSINATURA_JA_ATIVA:
              abrirAssinaturaAtiva();
              return;
            case CodigoErro.PAGAMENTO_RECUSADO:
              enviando.current = false;
              setRecusado(true);
              setErroEnvio("Pagamento recusado. Seu plano continua FREE.");
              return;
            // Pode ser falha antes da cobrança ou resultado incerto (timeout,
            // 5xx do gateway): o texto não promete que a nova tentativa passa.
            case CodigoErro.GATEWAY_INDISPONIVEL:
              enviando.current = false;
              setErroEnvio(
                "Não foi possível confirmar o pagamento agora. Se o GOLD não aparecer em alguns minutos, tente de novo ou fale com o suporte.",
              );
              return;
            // Uma cobrança anterior ficou sem resultado (limio-api#50): tentar de
            // novo cai no mesmo erro até a reconciliação (ETI-85).
            case CodigoErro.COBRANCA_EM_ANDAMENTO:
              enviando.current = false;
              setErroEnvio(
                "Seu pagamento está sendo processado. Se o GOLD não aparecer em alguns minutos, fale com o suporte.",
              );
              return;
            default:
              enviando.current = false;
              setErroEnvio(mensagemErroApi(falha, "Não foi possível assinar o GOLD."));
          }
        },
      },
    );
  };

  return {
    carregando: query.isPending,
    erro:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar o plano GOLD.")
        : null,
    tentandoDeNovo: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    plano: plano ? planoParaExibicao(plano) : null,
    podeAssinar: Boolean(plano?.cartaoSalvo) && !pendente,
    enviando: pendente,
    erroEnvio,
    recusado,
    avisoCartao,
    aoAssinar,
    // Sem cartão salvo ou "Trocar": o fluxo de cartão do gateway ainda não
    // existe na API (gerenciar GOLD, ETI-83/84).
    aoTrocarCartao: () => {
      if (!pendente) {
        setAvisoCartao(MENSAGEM_TROCA_EM_BREVE);
      }
    },
    aoVoltar: () => {
      if (pendente) {
        return;
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/(prestador)");
      }
    },
  };
}

export type AssinarGoldViewModel = ReturnType<typeof useAssinarGoldViewModel>;
