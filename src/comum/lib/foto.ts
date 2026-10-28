import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";

import {
  ArquivoFotoSchema,
  MENSAGEM_FOTO_INVALIDA,
  type ArquivoFoto,
} from "../tipos/foto";
import { lerArquivoLocal } from "./arquivoLocal";

/** Mesmo teto que a API aplica ao guardar (TICKET-0056): lado maior até 2048 px. */
const LADO_MAXIMO_PX = 2048;
const QUALIDADE_JPEG = 0.85;

/**
 * Chave de cache da foto: a URL sem a assinatura (query). O link é renovado a
 * cada `GET`, mas o objeto no storage é o mesmo até a foto ser trocada, que
 * grava um objeto novo.
 */
export function chaveCacheFoto(url: string): string {
  return url.split("?")[0];
}

export type PreparoFoto =
  | { valido: true; arquivo: ArquivoFoto }
  | { valido: false; mensagem: string };

/** Reduz só o lado maior, mantendo a proporção. Sem dimensões (0), não mexe. */
function reducao(
  largura: number,
  altura: number,
): { width: number } | { height: number } | null {
  if (largura <= 0 || altura <= 0 || Math.max(largura, altura) <= LADO_MAXIMO_PX) {
    return null;
  }
  return largura >= altura ? { width: LADO_MAXIMO_PX } : { height: LADO_MAXIMO_PX };
}

/**
 * Regrava a imagem escolhida como JPEG reduzido: HEIC do iPhone vira JPEG (a
 * API recusa HEIC) e a foto de câmera de 10+ MB cai pra bem menos de 5 MB.
 * Depois confere tipo e tamanho com o schema — o que não passar não é enviado.
 */
export async function prepararFoto(
  imagem: ImagePickerAsset,
  nome: string,
): Promise<PreparoFoto> {
  const contexto = ImageManipulator.manipulate(imagem.uri);
  const tamanho = reducao(imagem.width, imagem.height);
  if (tamanho) {
    contexto.resize(tamanho);
  }
  const renderizada = await contexto.renderAsync();
  const salva = await renderizada.saveAsync({
    format: SaveFormat.JPEG,
    compress: QUALIDADE_JPEG,
  });

  // Tamanho do arquivo gravado (o picker só sabe o do original) e, no web, o
  // conteúdo que vai no `FormData`.
  const { tamanhoBytes, conteudo } = await lerArquivoLocal(salva.uri);

  const resultado = ArquivoFotoSchema.safeParse({
    uri: salva.uri,
    nome,
    // O arquivo acabou de ser gravado em JPEG.
    tipo: "image/jpeg",
    tamanhoBytes,
    conteudo,
  });

  return resultado.success
    ? { valido: true, arquivo: resultado.data }
    : { valido: false, mensagem: MENSAGEM_FOTO_INVALIDA };
}

/** `FormData` com a foto na parte `campo`. Sem `Content-Type` manual: o axios deixa o navegador/RN pôr o boundary. */
export function formDataComFoto(campo: string, arquivo: ArquivoFoto): FormData {
  const valido = ArquivoFotoSchema.parse(arquivo);
  const corpo = new FormData();
  if (Platform.OS === "web" && valido.conteudo) {
    corpo.append(campo, valido.conteudo, valido.nome);
  } else {
    // No React Native o FormData lê o arquivo pela URI (formato próprio do RN).
    corpo.append(campo, {
      uri: valido.uri,
      name: valido.nome,
      type: valido.tipo,
    } as unknown as Blob);
  }
  return corpo;
}
