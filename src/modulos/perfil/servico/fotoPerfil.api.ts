import { api } from "../../../comum/lib/api";
import { formDataComFoto } from "../../../comum/lib/foto";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import {
  FotoPerfilResponseSchema,
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
  arquivo: ArquivoFoto,
): Promise<FotoPerfilResponse> {
  const { data } = await api.put(ROTA, formDataComFoto("arquivo", arquivo));
  return FotoPerfilResponseSchema.parse(data);
}
