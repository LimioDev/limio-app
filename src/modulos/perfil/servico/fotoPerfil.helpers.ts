import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";

import {
  ArquivoFotoPerfilSchema,
  MENSAGEM_FOTO_INVALIDA,
  type ArquivoFotoPerfil,
} from "../tipos/fotoPerfil.types";
import { lerArquivoLocal } from "./arquivoLocal";

/** Mesmo teto que a API aplica ao guardar (TICKET-0056): lado maior até 2048 px. */
const LADO_MAXIMO_PX = 2048;
const QUALIDADE_JPEG = 0.85;

export type PreparoFotoPerfil =
  | { valido: true; arquivo: ArquivoFotoPerfil }
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
export async function prepararFotoPerfil(
  imagem: ImagePickerAsset,
): Promise<PreparoFotoPerfil> {
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

  const resultado = ArquivoFotoPerfilSchema.safeParse({
    uri: salva.uri,
    nome: "foto-perfil.jpg",
    // O arquivo acabou de ser gravado em JPEG.
    tipo: "image/jpeg",
    tamanhoBytes,
    conteudo,
  });

  return resultado.success
    ? { valido: true, arquivo: resultado.data }
    : { valido: false, mensagem: MENSAGEM_FOTO_INVALIDA };
}
