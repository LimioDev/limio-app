import { api } from "../../../comum/lib/api";
import type { PapelDoApp } from "../../../comum/tipos/papel";
import { PerfilPublicoSchema, type PerfilPublico } from "../tipos/perfilPublico.types";

/**
 * Perfil público e reputação de outra pessoa (ETI-105). `papel` escolhe qual
 * dos dois perfis do usuário é lido: a mesma conta pode ser Empregador e
 * Prestador. Usuário que nunca existiu: 404 `PERFIL_NAO_ENCONTRADO`.
 */
export async function buscarPerfilPublico(
  usuarioId: string,
  papel: PapelDoApp,
): Promise<PerfilPublico> {
  const { data } = await api.get(`/perfis-publicos/${usuarioId}`, { params: { papel } });
  return PerfilPublicoSchema.parse(data);
}
