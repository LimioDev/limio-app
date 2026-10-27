import { z } from "zod";

/** Limites da `Avaliacao` no backend (ETI-107). */
export const NOTA_MIN = 1;
export const NOTA_MAX = 5;
export const COMENTARIO_MAX = 400;

/** Janela pra avaliar, contada a partir do `CONCLUIDO` (UC "Avaliar a outra parte"). */
export const JANELA_AVALIACAO_DIAS = 7;

/**
 * "Consultar avaliação pendente" de um serviço (ETI-107). `fotoUrl` é link
 * temporário, válido até `fotoExpiraEm`. `podeAvaliar` sai `false` quando o
 * usuário já avaliou ou a janela fechou.
 */
export const AvaliacaoPendenteResponseSchema = z.object({
  anuncioId: z.string(),
  nomeOutraParte: z.string(),
  fotoUrl: z.string().nullable(),
  fotoExpiraEm: z.string().nullable(),
  tituloServico: z.string(),
  concluidoEm: z.string(),
  podeAvaliar: z.boolean(),
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
