import { z } from "zod";

/**
 * Espelha `AvaliacaoRecenteResponse` (ETI-105). `avaliadorNome` já vem
 * abreviado ("Camila R.") ou "Conta encerrada". O comentário é opcional na
 * avaliação (ETI-107), por isso aceita `null`.
 */
export const AvaliacaoRecenteSchema = z.object({
  avaliadorNome: z.string(),
  nota: z.number().int().min(1).max(5),
  comentario: z.string().nullable(),
  data: z.string(),
});

export type AvaliacaoRecente = z.infer<typeof AvaliacaoRecenteSchema>;

/**
 * Espelha `PerfilPublicoResponse` — `GET /perfis-publicos/{usuarioId}?papel=`
 * (ETI-105), telas 20a e 20b. Nunca traz contato nem endereço.
 * `mediaAvaliacoes` é `null` enquanto `qtdAvaliacoes` é 0: a tela mostra
 * "Sem avaliações ainda", nunca 0,0. `especialidades` vem vazia pro
 * Empregador. Conta encerrada vem com `nomeExibicao` "Conta encerrada", sem
 * foto e sem especialidades, mas com a reputação.
 */
export const PerfilPublicoSchema = z.object({
  nomeExibicao: z.string(),
  fotoUrl: z.string().nullable(),
  fotoExpiraEm: z.string().nullable(),
  mediaAvaliacoes: z.number().nullable(),
  qtdAvaliacoes: z.number().int(),
  servicosConcluidos: z.number().int(),
  especialidades: z.array(z.string()),
  avaliacoesRecentes: z.array(AvaliacaoRecenteSchema),
});

export type PerfilPublico = z.infer<typeof PerfilPublicoSchema>;
