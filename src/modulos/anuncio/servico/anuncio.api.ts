import { api } from "../../../comum/lib/api";
import {
  DetalheAnuncioMuralSchema,
  MuralResponseSchema,
  PainelEmpregadorResponseSchema,
  type DetalheAnuncioMural,
  type FiltrosMural,
  type MuralResponse,
  type PainelEmpregadorResponse,
} from "../tipos/anuncio.types";

/** Resumo dos anúncios do Empregador logado — só os do perfil dele (ETI-52). */
export async function buscarPainelEmpregador(): Promise<PainelEmpregadorResponse> {
  const { data } = await api.get("/anuncios/painel-empregador");
  return PainelEmpregadorResponseSchema.parse(data);
}

/**
 * Mural do Prestador logado (ETI-73). Rota e parâmetros provisórios: o card do
 * back-end ainda está "a definir". A compatibilidade (especialidade, "Outros" e
 * raio do perfil) é da API; os filtros só reduzem a lista.
 */
export async function listarMural(
  filtros: FiltrosMural,
  pagina: number,
): Promise<MuralResponse> {
  const { data } = await api.get("/anuncios/mural", {
    params: {
      categorias: filtros.categorias.length > 0 ? filtros.categorias : undefined,
      raioKm: filtros.raioKm ?? undefined,
      quando: filtros.quando,
      pagina,
    },
    // `categorias=a&categorias=b`, como o Spring lê lista, em vez de `categorias[]=a`.
    paramsSerializer: { indexes: null },
  });
  return MuralResponseSchema.parse(data);
}

/** Detalhe do anúncio pro Prestador, sem endereço completo nem contato (ETI-73). */
export async function buscarDetalheAnuncioMural(
  id: string,
): Promise<DetalheAnuncioMural> {
  const { data } = await api.get(`/anuncios/mural/${id}`);
  return DetalheAnuncioMuralSchema.parse(data);
}
