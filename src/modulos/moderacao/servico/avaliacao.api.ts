import { api } from "../../../comum/lib/api";
import {
  AvaliacaoPendenteResponseSchema,
  AvaliacaoResponseSchema,
  AvaliarRequestSchema,
  type AvaliacaoPendenteResponse,
  type AvaliacaoResponse,
  type AvaliarRequest,
} from "../tipos/avaliacao.types";

/** Quem avaliar e se ainda dá tempo, pro serviço (anúncio) `anuncioId`. */
export async function buscarAvaliacaoPendente(
  anuncioId: string,
): Promise<AvaliacaoPendenteResponse> {
  const { data } = await api.get(`/anuncios/${anuncioId}/avaliacao-pendente`);
  return AvaliacaoPendenteResponseSchema.parse(data);
}

/** Grava a nota sobre a outra parte do serviço. */
export async function avaliar({
  anuncioId,
  request,
}: {
  anuncioId: string;
  request: AvaliarRequest;
}): Promise<AvaliacaoResponse> {
  const { data } = await api.post(
    `/anuncios/${anuncioId}/avaliacoes`,
    AvaliarRequestSchema.parse(request),
  );
  return AvaliacaoResponseSchema.parse(data);
}
