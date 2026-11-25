import { z } from "zod";

/** Espelha a plataforma aceita por "Registrar aparelho para push" (ETI-112). */
export const PlataformaPush = {
  ANDROID: "ANDROID",
  IOS: "IOS",
} as const;

export type PlataformaPush = (typeof PlataformaPush)[keyof typeof PlataformaPush];

/** `POST /notificacoes/aparelhos`: token do Expo Push Service + plataforma. */
export const RegistrarAparelhoPushRequestSchema = z.object({
  token: z.string().regex(/^Expo(nent)?PushToken\[.+\]$/),
  plataforma: z.enum(PlataformaPush),
});

export type RegistrarAparelhoPushRequest = z.infer<
  typeof RegistrarAparelhoPushRequestSchema
>;

/** `POST /notificacoes/aparelhos/remover` (logout). */
export const RemoverAparelhoPushRequestSchema = RegistrarAparelhoPushRequestSchema.pick({
  token: true,
});
