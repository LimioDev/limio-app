import { z } from "zod";

import { respostaPaginadaSchema } from "../../../comum/tipos/api";
import { StatusAnuncio, StatusCandidatura, type QuandoMural } from "./anuncio.enums";

/**
 * Um anúncio da lista "Seus anúncios" (`AnuncioPainelResponse` do backend).
 * `prestadorEscolhido` vem abreviado ("Rafael S.") quando já há candidatura
 * escolhida; senão a tela mostra `candidatos` (candidaturas `ENVIADA`).
 * `fotoUrl` sai sempre `null` até o anúncio ganhar foto.
 */
export const AnuncioResumoSchema = z.object({
  id: z.string(),
  fotoUrl: z.string().nullable(),
  descricao: z.string(),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  status: z.enum(StatusAnuncio),
  candidatos: z.number().int(),
  prestadorEscolhido: z.string().nullable(),
});

export type AnuncioResumo = z.infer<typeof AnuncioResumoSchema>;

/**
 * Painel do Empregador (tela 13 "Início"), `GET /anuncios/painel-empregador`
 * (ETI-52). Só traz os anúncios abertos, da data pretendida mais próxima pra
 * mais distante. `fotoUrl` é link temporário, válido até `fotoExpiraEm`.
 */
export const PainelEmpregadorResponseSchema = z.object({
  nomeExibicao: z.string(),
  fotoUrl: z.string().nullable(),
  fotoExpiraEm: z.string().nullable(),
  anunciosAbertos: z.number().int(),
  novosCandidatos: z.number().int(),
  anuncios: z.array(AnuncioResumoSchema),
});

export type PainelEmpregadorResponse = z.infer<
  typeof PainelEmpregadorResponseSchema
>;

/** Categoria resumida que vem dentro do anúncio do mural. */
export const CategoriaAnuncioSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

/**
 * Um anúncio do mural do Prestador (tela 28). Contrato provisório: o ETI-73
 * deixou a rota e os nomes "a definir". Nunca traz endereço completo,
 * coordenadas nem contato do Empregador. `publicadoEm` decide o selo "NOVO".
 */
export const AnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  categoria: CategoriaAnuncioSchema,
  fotoUrl: z.string().nullable(),
  nomeEmpregador: z.string(),
  fotoEmpregadorUrl: z.string().nullable(),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  distanciaKm: z.number(),
  publicadoEm: z.string(),
});

export type AnuncioMural = z.infer<typeof AnuncioMuralSchema>;

/** Página do mural; `totalElementos` é o "N serviços perto de você". */
export const MuralResponseSchema = respostaPaginadaSchema(AnuncioMuralSchema);

export type MuralResponse = z.infer<typeof MuralResponseSchema>;

/**
 * Filtros da tela 28a. Só reduzem a lista compatível que a API já monta:
 * `categorias` vazio é "todas" e `raioKm` nulo é o raio do perfil.
 */
export interface FiltrosMural {
  categorias: string[];
  raioKm: number | null;
  quando: QuandoMural;
}

/**
 * Detalhe do anúncio visto pelo Prestador (tela 30). `minhaCandidatura` vem
 * preenchida quando ele já se candidatou, e a tela troca "Candidatar-se" pela
 * situação. Contrato provisório, como o do mural.
 */
export const DetalheAnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  categoria: CategoriaAnuncioSchema,
  fotos: z.array(z.string()),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  uf: z.string(),
  distanciaKm: z.number(),
  empregador: z.object({
    id: z.string(),
    nomeExibicao: z.string(),
    fotoUrl: z.string().nullable(),
    mediaAvaliacoes: z.number().nullable(),
    totalAvaliacoes: z.number().int(),
  }),
  minhaCandidatura: z
    .object({
      status: z.enum(StatusCandidatura),
    })
    .nullable(),
});

export type DetalheAnuncioMural = z.infer<typeof DetalheAnuncioMuralSchema>;
