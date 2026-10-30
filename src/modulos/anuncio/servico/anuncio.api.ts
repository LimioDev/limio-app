import { z } from "zod";

import { api } from "../../../comum/lib/api";
import { formDataComFoto } from "../../../comum/lib/foto";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import {
  AnuncioCriadoResponseSchema,
  AnuncioDetalheResponseSchema,
  AnuncioRequestSchema,
  CandidaturaCriadaSchema,
  DetalheAnuncioMuralSchema,
  FotoAnuncioResponseSchema,
  MuralResponseSchema,
  PainelEmpregadorResponseSchema,
  type AnuncioCriadoResponse,
  type AnuncioDetalheResponse,
  type AnuncioRequest,
  type CandidaturaCriada,
  type DetalheAnuncioMural,
  type FiltrosMural,
  type FotoAnuncioResponse,
  type MuralResponse,
  type PainelEmpregadorResponse,
} from "../tipos/anuncio.types";

/** Resumo dos anúncios do Empregador logado — só os do perfil dele (ETI-52). */
export async function buscarPainelEmpregador(): Promise<PainelEmpregadorResponse> {
  const { data } = await api.get("/anuncios/painel-empregador");
  return PainelEmpregadorResponseSchema.parse(data);
}

/**
 * Mural do Prestador logado (ETI-73, `MuralController`). A compatibilidade
 * (especialidade, "Outros" e raio do perfil) é da API; os filtros só reduzem a
 * lista. Sem `raio`, vale o raio do perfil; `tamanho` fica no padrão (20).
 */
export async function listarMural(
  filtros: FiltrosMural,
  pagina: number,
): Promise<MuralResponse> {
  const { data } = await api.get("/anuncios/mural", {
    params: {
      categorias: filtros.categorias.length > 0 ? filtros.categorias : undefined,
      raio: filtros.raioKm ?? undefined,
      quando: filtros.quando,
      pagina,
    },
    // `categorias=a&categorias=b`, como o Spring lê lista, em vez de `categorias[]=a`.
    paramsSerializer: { indexes: null },
  });
  return MuralResponseSchema.parse(data);
}

/** Detalhe do anúncio pro Prestador, sem endereço completo nem contato (ETI-73). */
export async function buscarDetalheAnuncioMural(
  id: string,
): Promise<DetalheAnuncioMural> {
  const { data } = await api.get(`/anuncios/mural/${id}`);
  return DetalheAnuncioMuralSchema.parse(data);
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
 * Candidata o Prestador logado ao anúncio (ETI-75, `CandidaturaController` do
 * back). A cota é conferida pela API, não aqui.
 */
export async function candidatarAoAnuncio(
  anuncioId: string,
): Promise<CandidaturaCriada> {
  const { data } = await api.post(`/anuncios/${anuncioId}/candidaturas`);
  return CandidaturaCriadaSchema.parse(data);
}
