import { z } from "zod";

import { api } from "../../../comum/lib/api";
import { formDataComFoto } from "../../../comum/lib/foto";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import {
  AnuncioCriadoResponseSchema,
  AnuncioDetalheResponseSchema,
  AnuncioRequestSchema,
  CandidatosResponseSchema,
  CandidaturaCriadaSchema,
  DetalheAnuncioMuralSchema,
  EditarAnuncioRequestSchema,
  EscolhaResponseSchema,
  FotoAnuncioResponseSchema,
  MinhasCandidaturasResponseSchema,
  MuralResponseSchema,
  PainelEmpregadorResponseSchema,
  ServicoCombinadoSchema,
  ServicoIniciadoSchema,
  type AnuncioCriadoResponse,
  type AnuncioDetalheResponse,
  type AnuncioRequest,
  type CandidatosResponse,
  type CandidaturaCriada,
  type DetalheAnuncioMural,
  type EditarAnuncioRequest,
  type EscolhaResponse,
  type FiltrosMural,
  type FotoAnuncioResponse,
  type MinhasCandidaturasResponse,
  type MuralResponse,
  type PainelEmpregadorResponse,
  type ServicoCombinado,
  type ServicoIniciado,
} from "../tipos/anuncio.types";
import type { AbaCandidatura } from "../tipos/anuncio.enums";

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
 * Edita o anúncio do Empregador logado (ETI-61, `PUT /anuncios/{id}`) e
 * devolve o anúncio atualizado, igual ao `GET`. Só vale em `PUBLICADO` sem
 * candidatura escolhida; fora disso a API responde `409 ANUNCIO_ESTADO_INVALIDO`.
 */
export async function editarAnuncio({
  id,
  request,
}: {
  id: string;
  request: EditarAnuncioRequest;
}): Promise<AnuncioDetalheResponse> {
  const corpo = EditarAnuncioRequestSchema.parse(request);
  const { data } = await api.put(`/anuncios/${id}`, corpo);
  return AnuncioDetalheResponseSchema.parse(data);
}

/**
 * Remove uma foto do anúncio (ETI-61): `204` sem corpo. Foto que já saiu
 * responde `404 ENTIDADE_NAO_ENCONTRADA`; anúncio já combinado, `409`.
 */
export async function removerFotoAnuncio({
  anuncioId,
  fotoId,
}: {
  anuncioId: string;
  fotoId: string;
}): Promise<void> {
  await api.delete(`/anuncios/${anuncioId}/fotos/${fotoId}`);
}

/**
 * Cancela o anúncio do Empregador logado (ETI-63): sai do mural como
 * `ENCERRADO` e as candidaturas `ENVIADA` são encerradas. Com candidatura
 * escolhida ou fora de `PUBLICADO`, a API responde `409 ANUNCIO_ESTADO_INVALIDO`.
 */
export async function cancelarAnuncio(id: string): Promise<void> {
  await api.post(`/anuncios/${id}/cancelar`);
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

/**
 * Candidatos `ENVIADA` do anúncio do Empregador logado (ETI-67,
 * `CandidatoController`). Anúncio de outra pessoa responde `404`.
 */
export async function listarCandidatos(anuncioId: string): Promise<CandidatosResponse> {
  const { data } = await api.get(`/anuncios/${anuncioId}/candidaturas`);
  return CandidatosResponseSchema.parse(data);
}

/** Recusa o candidato e devolve a lista já sem ele (ETI-67). */
export async function recusarCandidato({
  anuncioId,
  candidaturaId,
}: {
  anuncioId: string;
  candidaturaId: string;
}): Promise<CandidatosResponse> {
  const { data } = await api.post(
    `/anuncios/${anuncioId}/candidaturas/${candidaturaId}/recusar`,
  );
  return CandidatosResponseSchema.parse(data);
}

/**
 * "Escolher prestador" (ETI-69, `CandidatoController`): numa só transação a
 * candidatura vira `ESCOLHIDA`, as outras `ENVIADA` encerram e a cota do
 * Prestador FREE é consumida. Falhas são `409`: `COTA_ESGOTADA_CANDIDATO`
 * (nada muda), `ESCOLHA_CONFLITO`, `ANUNCIO_ESTADO_INVALIDO` e
 * `CANDIDATURA_ESTADO_INVALIDO`.
 */
export async function escolherPrestador({
  anuncioId,
  candidaturaId,
}: {
  anuncioId: string;
  candidaturaId: string;
}): Promise<EscolhaResponse> {
  const { data } = await api.post(
    `/anuncios/${anuncioId}/candidaturas/${candidaturaId}/escolher`,
  );
  return EscolhaResponseSchema.parse(data);
}

/**
 * Serviço combinado (ETI-86, `ConsultarServicoController`), com o contato da
 * outra parte liberado. Quem não é o Empregador dono nem o Prestador escolhido
 * recebe `404 SERVICO_NAO_ENCONTRADO`, igual a um id inexistente.
 */
export async function buscarServico(anuncioId: string): Promise<ServicoCombinado> {
  const { data } = await api.get(`/anuncios/${anuncioId}/servico`);
  return ServicoCombinadoSchema.parse(data);
}

/**
 * "Iniciar serviço" do Prestador escolhido (ETI-88, `IniciarServicoController`),
 * sem corpo. Fora de `PUBLICADO` (ex.: já iniciado) a API responde
 * `409 SERVICO_ESTADO_INVALIDO`.
 */
export async function iniciarServico(anuncioId: string): Promise<ServicoIniciado> {
  const { data } = await api.post(`/anuncios/${anuncioId}/iniciar`);
  return ServicoIniciadoSchema.parse(data);
}

/**
 * Candidaturas do Prestador logado numa aba da tela 32 (ETI-77,
 * `MinhasCandidaturasController`). `pagina` começa em 0; 20 por página.
 */
export async function listarMinhasCandidaturas(
  aba: AbaCandidatura,
  pagina: number,
): Promise<MinhasCandidaturasResponse> {
  const { data } = await api.get("/candidaturas/minhas", { params: { aba, pagina } });
  return MinhasCandidaturasResponseSchema.parse(data);
}

/**
 * Desiste de uma candidatura `ENVIADA` (ETI-77): `200` sem corpo. Já escolhida
 * responde `409 USE_CANCELAMENTO_SERVICO`; já encerrada, `409
 * CANDIDATURA_ESTADO_INVALIDO`; de outra pessoa, `404 CANDIDATURA_NAO_ENCONTRADA`.
 */
export async function desistirCandidatura(candidaturaId: string): Promise<void> {
  await api.post(`/candidaturas/${candidaturaId}/desistir`);
}
