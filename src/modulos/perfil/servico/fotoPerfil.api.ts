import { Platform } from "react-native";

import { api } from "../../../comum/lib/api";
import {
  ArquivoFotoPerfilSchema,
  FotoPerfilResponseSchema,
  type ArquivoFotoPerfil,
  type FotoPerfilResponse,
} from "../tipos/fotoPerfil.types";

const ROTA = "/conta/foto-perfil";

/** Foto atual do usuário logado; `null` se ele nunca enviou (204). */
export async function buscarFotoPerfil(): Promise<FotoPerfilResponse | null> {
  const resposta = await api.get(ROTA);
  if (resposta.status === 204) {
    return null;
  }
  return FotoPerfilResponseSchema.parse(resposta.data);
}

/** Envia ou troca a foto (multipart, parte `arquivo`). A mesma vale pros dois papéis. */
export async function enviarFotoPerfil(
  arquivo: ArquivoFotoPerfil,
): Promise<FotoPerfilResponse> {
  const valido = ArquivoFotoPerfilSchema.parse(arquivo);
  const corpo = new FormData();
  if (Platform.OS === "web" && valido.conteudo) {
    corpo.append("arquivo", valido.conteudo, valido.nome);
  } else {
    // No React Native o FormData lê o arquivo pela URI (formato próprio do RN).
    corpo.append("arquivo", {
      uri: valido.uri,
      name: valido.nome,
      type: valido.tipo,
    } as unknown as Blob);
  }
  // Sem `Content-Type` manual: o axios deixa o navegador/RN pôr o boundary.
  const { data } = await api.put(ROTA, corpo);
  return FotoPerfilResponseSchema.parse(data);
}
