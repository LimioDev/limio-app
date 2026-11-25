import { api } from "../lib/api";
import {
  RegistrarAparelhoPushRequestSchema,
  RemoverAparelhoPushRequestSchema,
  type RegistrarAparelhoPushRequest,
} from "../tipos/aparelhoPush";

/**
 * Fica em `comum/` porque o `notificacao` registra (login e abertura do app) e
 * o `auth` remove (logout). Upsert por token no back: registrar de novo não
 * duplica, e outra conta que entra no aparelho passa a receber o push.
 */
export async function registrarAparelhoPush(
  request: RegistrarAparelhoPushRequest,
): Promise<void> {
  const corpo = RegistrarAparelhoPushRequestSchema.parse(request);
  await api.post("/notificacoes/aparelhos", corpo);
}

/** 204 sempre, mesmo pra token de outra conta: o logout não pode travar aqui. */
export async function removerAparelhoPush(token: string): Promise<void> {
  const corpo = RemoverAparelhoPushRequestSchema.parse({ token });
  await api.post("/notificacoes/aparelhos/remover", corpo);
}
