import { z } from "zod";

import { Plano, StatusEscolha } from "./cota.enums";

/** Espelha `EscolhaDoMesResponse` do backend: um item de "Onde você usou sua cota". */
export const EscolhaDoMesSchema = z.object({
  anuncioId: z.uuid(),
  titulo: z.string(),
  dataHoraServico: z.iso.datetime({ offset: true }),
  escolhidaEm: z.iso.datetime({ offset: true }),
  status: z.enum(StatusEscolha),
});

export type EscolhaDoMes = z.infer<typeof EscolhaDoMesSchema>;

/**
 * Espelha `CotaDoMesResponse` do backend — `GET /perfil/prestador/cota`
 * (ETI-79). `anoMes` é `AAAA-MM`; `tetoAplicado` é nulo no GOLD (sem teto);
 * `renovaEm` é o dia 1 do mês seguinte, 00:00 de São Paulo, com offset.
 * O app não conta a cota: usa `escolhasConsumidas` e `esgotada` da API.
 */
export const CotaDoMesResponseSchema = z.object({
  plano: z.enum(Plano),
  anoMes: z.string().regex(/^\d{4}-\d{2}$/),
  escolhasConsumidas: z.number().int().nonnegative(),
  tetoAplicado: z.number().int().positive().nullable(),
  esgotada: z.boolean(),
  renovaEm: z.iso.datetime({ offset: true }),
  escolhas: z.array(EscolhaDoMesSchema),
});

export type CotaDoMesResponse = z.infer<typeof CotaDoMesResponseSchema>;
