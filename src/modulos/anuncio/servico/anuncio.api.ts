import { z } from "zod";

import { api } from "../../../comum/lib/api";
import { formDataComFoto } from "../../../comum/lib/foto";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import {
  AnuncioCriadoResponseSchema,
  AnuncioDetalheResponseSchema,
  AnuncioRequestSchema,
  FotoAnuncioResponseSchema,
  PainelEmpregadorResponseSchema,
  type AnuncioCriadoResponse,
  type AnuncioDetalheResponse,
  type AnuncioRequest,
  type FotoAnuncioResponse,
  type PainelEmpregadorResponse,
} from "../tipos/anuncio.types";

/** Resumo dos anúncios do Empregador logado — só os do perfil dele (ETI-52). */
export async function buscarPainelEmpregador(): Promise<PainelEmpregadorResponse> {
  const { data } = await api.get("/anuncios/painel-empregador");
  return PainelEmpregadorResponseSchema.parse(data);
}

/**
 * Cria e publica o anúncio do Empregador logado. Quem pode publicar (contatos
 * confirmados, papel `CONTRATANTE`) quem decide é a API.
 */
export async function criarAnuncio(request: AnuncioRequest): Promise<AnuncioCriadoResponse> {
  const corpo = AnuncioRequestSchema.parse(request);
  const { data } = await api.post("/anuncios", corpo);
  return AnuncioCriadoResponseSchema.parse(data);
}

/**
 * Anexa uma foto ao anúncio (multipart, parte `arquivos`). A rota aceita
 * várias, mas o app manda uma por vez: assim sabe qual foto a API recusou.
 */
export async function anexarFotoAnuncio({
  anuncioId,
  arquivo,
}: {
  anuncioId: string;
  arquivo: ArquivoFoto;
}): Promise<FotoAnuncioResponse[]> {
  const { data } = await api.post(
    `/anuncios/${anuncioId}/fotos`,
    formDataComFoto("arquivos", arquivo),
  );
  return z.array(FotoAnuncioResponseSchema).parse(data);
}

/** Anúncio do Empregador logado; de outra pessoa a API responde `404`. */
export async function buscarAnuncio(id: string): Promise<AnuncioDetalheResponse> {
  const { data } = await api.get(`/anuncios/${id}`);
  return AnuncioDetalheResponseSchema.parse(data);
}

/**
 * Cancela o anúncio do Empregador logado (ETI-63): sai do mural como
 * `ENCERRADO` e as candidaturas `ENVIADA` são encerradas. Com candidatura
 * escolhida ou fora de `PUBLICADO`, a API responde `409 ANUNCIO_ESTADO_INVALIDO`.
 */
export async function cancelarAnuncio(id: string): Promise<void> {
  await api.post(`/anuncios/${id}/cancelar`);
}
