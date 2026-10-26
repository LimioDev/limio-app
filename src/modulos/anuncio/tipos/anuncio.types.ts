import { z } from "zod";

import { StatusAnuncio } from "./anuncio.enums";

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
