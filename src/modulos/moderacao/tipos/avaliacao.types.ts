import { z } from "zod";

import { PapelUsuario } from "../../../comum/tipos/papel";

/** Limites da `Avaliacao` no backend (ETI-107). */
export const NOTA_MIN = 1;
export const NOTA_MAX = 5;
export const COMENTARIO_MAX = 400;

/** Nome da outra parte com a conta encerrada (`OutraParte.NOME_CONTA_ENCERRADA` no back). */
export const NOME_CONTA_ENCERRADA = "Usuário excluído";

/**
 * Quem vai ser avaliado. `fotoUrl` é link temporário, válido até
 * `fotoExpiraEm`. Conta encerrada vem como "Usuário excluído", sem foto.
 */
export const OutraParteSchema = z.object({
  nome: z.string(),
  fotoUrl: z.string().nullable(),
  fotoExpiraEm: z.string().nullable(),
  papel: z.enum([PapelUsuario.EMPREGADOR, PapelUsuario.PRESTADOR]),
});

export type OutraParte = z.infer<typeof OutraParteSchema>;

/**
 * "Consultar avaliação pendente" (`GET /anuncios/{anuncioId}/avaliacao-pendente`).
 * `servico.concluidoEm` e `avaliarAte` são `null` enquanto o serviço não foi
 * concluído; `outraParte` é `null` enquanto nenhum Prestador foi escolhido.
 * `podeAvaliar` só é `true` com o serviço concluído, antes de `avaliarAte`
 * (exclusivo) e sem avaliação de quem consulta.
 */
export const AvaliacaoPendenteResponseSchema = z.object({
  servico: z.object({
    id: z.string(),
    titulo: z.string(),
    concluidoEm: z.string().nullable(),
  }),
  outraParte: OutraParteSchema.nullable(),
  podeAvaliar: z.boolean(),
  avaliarAte: z.string().nullable(),
});

export type AvaliacaoPendenteResponse = z.infer<
  typeof AvaliacaoPendenteResponseSchema
>;

/** Corpo do "Avaliar". Comentário em branco vai como `null`. */
export const AvaliarRequestSchema = z.object({
  nota: z.number().int().min(NOTA_MIN).max(NOTA_MAX),
  comentario: z.string().trim().min(1).max(COMENTARIO_MAX).nullable(),
});

export type AvaliarRequest = z.infer<typeof AvaliarRequestSchema>;

/** `201` do "Avaliar" (`POST /anuncios/{anuncioId}/avaliacoes`). */
export const AvaliacaoResponseSchema = z.object({
  id: z.string(),
  anuncioId: z.string(),
  nota: z.number().int(),
  comentario: z.string().nullable(),
  publicadaEm: z.string(),
});

export type AvaliacaoResponse = z.infer<typeof AvaliacaoResponseSchema>;
