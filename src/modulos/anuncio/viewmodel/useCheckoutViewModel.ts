import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { prepararFoto } from "../../../comum/lib/foto";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import { useCheckoutMutation, useServicoQuery } from "../servico/anuncio.queries";
import type { FotoRascunho } from "../store/rascunhoAnuncio.store";
import { FOTOS_CHECKOUT_MAX } from "../tipos/anuncio.types";

/** Miniatura da grade da tela 38. */
export interface FotoCheckoutExibida {
  chave: string;
  uri: string;
  /** Motivo da recusa no preparo; a foto recusada não é enviada. */
  erro: string | null;
}

/** Folha "Remover foto?" ao tocar numa miniatura. */
export interface FolhaRemoverFotoExibida {
  aberta: boolean;
  /** "Foto 2". */
  rotulo: string;
}

const MENSAGEM_FALHA_GALERIA = "Não foi possível abrir suas fotos. Tente de novo.";
const MENSAGEM_FALHA_PREPARO = "Não foi possível ler essa imagem. Escolha outra.";
const MENSAGEM_FOTOS_RECUSADAS = "Remova as fotos recusadas para enviar o check-out.";

const Origem = {
  CAMERA: "CAMERA",
  GALERIA: "GALERIA",
} as const;

type Origem = (typeof Origem)[keyof typeof Origem];

function avisarPermissaoNegada(origem: Origem): void {
  const camera = origem === Origem.CAMERA;
  Alert.alert(
    camera ? "Sem acesso à câmera" : "Sem acesso às fotos",
    camera
      ? "Para fotografar o serviço pronto, permita que o LIMIO use a câmera nos ajustes do aparelho."
      : "Para anexar fotos do serviço, permita que o LIMIO acesse suas fotos nos ajustes do aparelho.",
    [
      { text: "Agora não", style: "cancel" },
      { text: "Abrir ajustes", onPress: () => void Linking.openSettings() },
    ],
  );
}

let contadorChave = 0;

/** Prepara cada imagem escolhida (JPEG reduzido + conferência de tipo e tamanho). */
async function prepararEscolhidas(imagens: ImagePicker.ImagePickerAsset[]): Promise<FotoRascunho[]> {
  const fotos: FotoRascunho[] = [];
  for (const imagem of imagens) {
    contadorChave += 1;
    const chave = `checkout-${Date.now()}-${contadorChave}`;
    const preparo = await prepararFoto(imagem, `${chave}.jpg`).catch(() => null);
    fotos.push({
      chave,
      previewUri: imagem.uri,
      arquivo: preparo?.valido ? preparo.arquivo : null,
      erro: !preparo ? MENSAGEM_FALHA_PREPARO : preparo.valido ? null : preparo.mensagem,
    });
  }
  return fotos;
}

/** "Marina Bertoldi" → "Marina"; sem nome (conta encerrada), "o Empregador". */
function primeiroNome(nome: string | null | undefined): string {
  return nome?.trim().split(/\s+/)[0] || "o Empregador";
}

function maiusculaInicial(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Tela 38 "Checkout" do Prestador escolhido (ETI-91): fotos do serviço pronto
 * e observação, enviadas juntas no "Enviar check-out". Só sai da tela no
 * sucesso (volta pra "Seu serviço" já em "Aguardando validação") ou quando o
 * serviço não aceita mais check-out.
 *
 * TODO(ETI-62): a escolha de fotos (câmera/galeria + permissão) repete a da
 * tela 14; quando a PR do ETI-62 entrar, trocar pelo `useEscolhaDeFotos`.
 */
export function useCheckoutViewModel(anuncioId: string) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  // Já em cache pela tela 37: só dá o nome do Empregador pros textos.
  const servico = useServicoQuery(anuncioId);
  const checkout = useCheckoutMutation(anuncioId);

  const [fotos, setFotos] = useState<FotoRascunho[]>([]);
  const [observacao, setObservacao] = useState("");
  /** `FOTO_OBRIGATORIA`/`FOTO_INVALIDA` da API, mostrado junto das fotos. */
  const [erroFotos, setErroFotos] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [folhaFotoVisivel, setFolhaFotoVisivel] = useState(false);
  const [preparandoFotos, setPreparandoFotos] = useState(false);
  // Travas desde o toque: `isPending` só muda no próximo render, e um toque
  // duplo mandaria dois check-outs; a galeria e o preparo também têm esperas.
  const escolhendo = useRef(false);
  const enviando = useRef(false);

  const vagas = FOTOS_CHECKOUT_MAX - fotos.length;

  const adicionarDe = async (origem: Origem) => {
    setFolhaFotoVisivel(false);
    if (escolhendo.current || vagas <= 0) {
      return;
    }
    escolhendo.current = true;
    try {
      // iOS com acesso "limitado" também vem `granted`. No web a chamada não faz nada.
      const permissao =
        origem === Origem.CAMERA
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        avisarPermissaoNegada(origem);
        return;
      }
      const escolha =
        origem === Origem.CAMERA
          ? await ImagePicker.launchCameraAsync({ mediaTypes: "images", quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: "images",
              allowsMultipleSelection: true,
              selectionLimit: vagas,
              quality: 1,
            });
      if (escolha.canceled) {
        return;
      }
      setPreparandoFotos(true);
      // No Android o limite de seleção nem sempre é respeitado.
      const novas = await prepararEscolhidas(escolha.assets.slice(0, vagas));
      setFotos((atuais) => [...atuais, ...novas].slice(0, FOTOS_CHECKOUT_MAX));
      setErroFotos(null);
    } catch {
      mostrarToast(MENSAGEM_FALHA_GALERIA, TipoToast.ERRO);
    } finally {
      escolhendo.current = false;
      setPreparandoFotos(false);
    }
  };

  const confirmarRemocao = () => {
    setFotos((atuais) => atuais.filter((foto) => foto.chave !== removendo));
    setRemovendo(null);
    setErroFotos(null);
  };

  const arquivos = fotos
    .map((foto) => foto.arquivo)
    .filter((arquivo): arquivo is ArquivoFoto => arquivo !== null);
  const temRecusada = fotos.some((foto) => foto.erro);
  const podeEnviar =
    arquivos.length > 0 && !temRecusada && !preparandoFotos && !checkout.isPending;

  /**
   * Volta pra "Seu serviço" (a mutation já recarrega). Aberta sem a tela 37
   * embaixo (link direto), troca por ela em vez de ficar parada.
   */
  const voltarAoServico = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/(app)/servico/[id]", params: { id: anuncioId } });
    }
  };

  const sairComAviso = (mensagem: string) => {
    mostrarToast(mensagem, TipoToast.ERRO);
    voltarAoServico();
  };

  const aoEnviar = () => {
    if (enviando.current || !podeEnviar) {
      return;
    }
    enviando.current = true;
    setErroFotos(null);
    setErroEnvio(null);
    checkout.mutate(
      { arquivos, observacao },
      {
        onSuccess: () => {
          // A trava fica: a tela está saindo.
          mostrarToast("Check-out enviado. Agora é só aguardar a validação.", TipoToast.SUCESSO);
          voltarAoServico();
        },
        onError: (falha) => {
          enviando.current = false;
          switch (erroApi(falha)?.codigo) {
            case CodigoErro.FOTO_OBRIGATORIA:
            case CodigoErro.FOTO_INVALIDA:
              setErroFotos(mensagemErroApi(falha, "Confira as fotos e tente de novo."));
              return;
            // Já enviado, cancelado ou concluído entre abrir a tela e enviar.
            case CodigoErro.SERVICO_ESTADO_INVALIDO:
              sairComAviso("Este serviço não aceita mais check-out.");
              return;
            // Deixou de ser o escolhido (ETI-87).
            case CodigoErro.SERVICO_NAO_ENCONTRADO:
              sairComAviso("Este serviço não está mais disponível.");
              return;
            default:
              setErroEnvio(mensagemErroApi(falha, "Não foi possível enviar o check-out."));
          }
        },
      },
    );
  };

  const empregador = primeiroNome(servico.data?.outraParte.nome);
  const fotosExibidas: FotoCheckoutExibida[] = fotos.map((foto) => ({
    chave: foto.chave,
    uri: foto.previewUri,
    erro: foto.erro,
  }));
  const indiceRemovendo = fotos.findIndex((foto) => foto.chave === removendo);

  return {
    /** "Isso ajuda Marina a aprovar...". */
    empregador,
    /**
     * O prazo de validação não vem no `GET` do serviço (só na resposta do
     * check-out), e o número não fica fixo no app: o texto fica sem ele.
     */
    avisoValidacao: `${maiusculaInicial(empregador)} tem um prazo para validar. Sem resposta, o serviço conclui sozinho.`,
    fotos: fotosExibidas,
    fotosMax: FOTOS_CHECKOUT_MAX,
    podeAdicionarFoto: vagas > 0 && !preparandoFotos && !checkout.isPending,
    preparandoFotos,
    erroFotos: erroFotos ?? (temRecusada ? MENSAGEM_FOTOS_RECUSADAS : null),
    aoAdicionarFoto: () => setFolhaFotoVisivel(true),
    folhaFotoVisivel,
    aoTirarFoto: () => void adicionarDe(Origem.CAMERA),
    aoEscolherDaGaleria: () => void adicionarDe(Origem.GALERIA),
    aoFecharFolhaFoto: () => setFolhaFotoVisivel(false),
    aoTocarFoto: (chave: string) => {
      if (!checkout.isPending) {
        setRemovendo(chave);
      }
    },
    folhaRemover: {
      aberta: indiceRemovendo >= 0,
      rotulo: `Foto ${indiceRemovendo + 1}`,
    } satisfies FolhaRemoverFotoExibida,
    aoConfirmarRemocao: confirmarRemocao,
    aoFecharFolhaRemover: () => setRemovendo(null),
    observacao,
    aoMudarObservacao: setObservacao,
    podeEnviar,
    enviando: checkout.isPending,
    erroEnvio,
    aoEnviar,
    aoVoltar: voltarAoServico,
  };
}
