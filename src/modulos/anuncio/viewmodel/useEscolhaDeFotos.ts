import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useRef, useState } from "react";
import { Alert } from "react-native";

import { prepararFoto } from "../../../comum/lib/foto";
import { TipoToast, useToast } from "../../../comum/store/toast";
import type { FotoRascunho } from "../store/rascunhoAnuncio.store";

const MENSAGEM_FALHA_GALERIA = "Não foi possível abrir suas fotos. Tente de novo.";
const MENSAGEM_FALHA_PREPARO = "Não foi possível ler essa imagem. Escolha outra.";

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
      ? "Para tirar fotos do anúncio, permita que o LIMIO use a câmera nos ajustes do aparelho."
      : "Para anexar fotos ao anúncio, permita que o LIMIO acesse suas fotos nos ajustes do aparelho.",
    [
      { text: "Agora não", style: "cancel" },
      { text: "Abrir ajustes", onPress: () => void Linking.openSettings() },
    ],
  );
}

let contadorChave = 0;

/** Prepara cada imagem escolhida (JPEG reduzido + conferência). A recusada volta com o motivo. */
async function prepararEscolhidas(imagens: ImagePicker.ImagePickerAsset[]): Promise<FotoRascunho[]> {
  const fotos: FotoRascunho[] = [];
  for (const imagem of imagens) {
    contadorChave += 1;
    const chave = `foto-${Date.now()}-${contadorChave}`;
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

/**
 * Folha "Adicionar foto" (tela 14c) das telas 14 e 16a: câmera (uma foto) ou
 * galeria (várias, até as `vagas`). As escolhidas chegam já preparadas em
 * `aoEscolher`; nada é enviado à API aqui.
 */
export function useEscolhaDeFotos({
  vagas,
  aoEscolher,
}: {
  vagas: number;
  aoEscolher: (fotos: FotoRascunho[]) => void;
}) {
  const mostrarToast = useToast((estado) => estado.mostrar);
  // Trava desde o toque: a galeria e o preparo têm esperas em que um segundo toque passaria.
  const escolhendo = useRef(false);
  const [preparandoFotos, setPreparandoFotos] = useState(false);
  const [folhaFotoVisivel, setFolhaFotoVisivel] = useState(false);

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
      aoEscolher(await prepararEscolhidas(escolha.assets.slice(0, vagas)));
    } catch {
      mostrarToast(MENSAGEM_FALHA_GALERIA, TipoToast.ERRO);
    } finally {
      escolhendo.current = false;
      setPreparandoFotos(false);
    }
  };

  return {
    preparandoFotos,
    podeAdicionarFoto: vagas > 0 && !preparandoFotos,
    aoAdicionarFoto: () => setFolhaFotoVisivel(true),
    folhaFotoVisivel,
    aoTirarFoto: () => void adicionarDe(Origem.CAMERA),
    aoEscolherDaGaleria: () => void adicionarDe(Origem.GALERIA),
    aoFecharFolhaFoto: () => setFolhaFotoVisivel(false),
  };
}
