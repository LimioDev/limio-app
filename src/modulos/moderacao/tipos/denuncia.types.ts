import { z } from "zod";

import { MotivoDenuncia } from "./denuncia.enums";

/** Limite da descrição no back (`Denuncia.DESCRICAO_MAX`, ETI-114). */
export const DESCRICAO_DENUNCIA_MAX = 1000;

/**
 * Contra quem é a denúncia, vindo da tela de onde o usuário chegou:
 * `denunciadoId` e/ou no máximo um contexto (`anuncioId`, `candidaturaId`,
 * `mensagemId`). Só `denunciadoId` é denúncia de perfil; com um contexto o
 * back tira o denunciado dele.
 */
export const AlvoDenunciaSchema = z
  .object({
    denunciadoId: z.string().min(1).optional(),
    anuncioId: z.string().min(1).optional(),
    candidaturaId: z.string().min(1).optional(),
    mensagemId: z.string().min(1).optional(),
  })
  .refine(
    ({ denunciadoId, anuncioId, candidaturaId, mensagemId }) => {
      const contextos = [anuncioId, candidaturaId, mensagemId].filter(Boolean).length;
      return contextos <= 1 && (contextos === 1 || !!denunciadoId);
    },
    { error: "Informe quem ou o que está sendo denunciado." },
  );

export type AlvoDenuncia = z.infer<typeof AlvoDenunciaSchema>;

/** Campos de texto do "Registrar denúncia"; a foto vai à parte. */
export const RegistrarDenunciaRequestSchema = z.object({
  motivo: z.enum(MotivoDenuncia),
  descricao: z.string().trim().min(1).max(DESCRICAO_DENUNCIA_MAX),
});

export type RegistrarDenunciaRequest = z.infer<typeof RegistrarDenunciaRequestSchema>;

/**
 * `201` do "Registrar denúncia" (`POST /denuncias`). `numero` é o que se
 * mostra ao usuário. `statusResolucao` fica texto: a fila do admin (US58)
 * vai trazer status novos.
 */
export const DenunciaRegistradaSchema = z.object({
  id: z.string(),
  numero: z.number().int(),
  statusResolucao: z.string(),
  prazoAnalise: z.string(),
});

export type DenunciaRegistrada = z.infer<typeof DenunciaRegistradaSchema>;
