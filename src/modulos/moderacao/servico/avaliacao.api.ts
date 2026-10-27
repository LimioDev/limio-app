import { api } from "../../../comum/lib/api";
import {
  AvaliacaoPendenteResponseSchema,
  AvaliarRequestSchema,
  type AvaliacaoPendenteResponse,
  type AvaliarRequest,
} from "../tipos/avaliacao.types";

// Rotas provisórias: o contrato do ETI-107 ainda está "a definir".

/** Quem avaliar e se ainda dá tempo, pro serviço (anúncio) `anuncioId`. */
export async function buscarAvaliacaoPendente(
  anuncioId: string,
): Promise<AvaliacaoPendenteResponse> {
  const { data } = await api.get(`/anuncios/${anuncioId}/avaliacao`);
  return AvaliacaoPendenteResponseSchema.parse(data);
}

/** Grava a nota sobre a outra parte do serviço. A API responde `201` sem corpo útil. */
export async function avaliar({
  anuncioId,
  request,
}: {
  anuncioId: string;
  request: AvaliarRequest;
}): Promise<void> {
  await api.post(
    `/anuncios/${anuncioId}/avaliacao`,
    AvaliarRequestSchema.parse(request),
  );
}
