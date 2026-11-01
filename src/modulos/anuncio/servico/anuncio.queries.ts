import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CandidatosResponse,
  DetalheAnuncioMural,
  FiltrosMural,
} from "../tipos/anuncio.types";
import {
  anexarFotoAnuncio,
  buscarAnuncio,
  buscarDetalheAnuncioMural,
  candidatarAoAnuncio,
  listarCandidatos,
  recusarCandidato,
  buscarPainelEmpregador,
  criarAnuncio,
  listarMural,
} from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
  mural: (filtros: FiltrosMural) => ["anuncio", "mural", filtros] as const,
  totalMural: (filtros: FiltrosMural) => ["anuncio", "mural", "total", filtros] as const,
  detalheMural: (id: string) => ["anuncio", "mural", "detalhe", id] as const,
  detalhe: (id: string) => ["anuncio", "detalhe", id] as const,
  candidatos: (id: string) => ["anuncio", "candidatos", id] as const,
};

export function usePainelEmpregadorQuery() {
  return useQuery({
    queryKey: chavesAnuncio.painelEmpregador,
    queryFn: buscarPainelEmpregador,
    // Candidatos chegam o tempo todo. A nova consulta ao voltar pra tela
    // (aba já montada) fica no `useFocusEffect` do ViewModel.
    staleTime: 0,
  });
}

/** Mural paginado: cada filtro tem a própria lista; rolar até o fim pede a próxima página. */
export function useMuralQuery(filtros: FiltrosMural) {
  return useInfiniteQuery({
    queryKey: chavesAnuncio.mural(filtros),
    queryFn: ({ pageParam }) => listarMural(filtros, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) =>
      ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
  });
}

/**
 * Só o total do "Ver N serviços" da folha de filtros, enquanto ela está aberta.
 * Mantém o número anterior na troca de filtro pra o botão não piscar.
 */
export function useTotalMuralQuery(filtros: FiltrosMural, habilitado: boolean) {
  return useQuery({
    queryKey: chavesAnuncio.totalMural(filtros),
    queryFn: () => listarMural(filtros, 0),
    select: (pagina) => pagina.totalElementos,
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}

/**
 * "Confirmar candidatura" da tela 31. No sucesso, a tela 30 já mostra a
 * candidatura enviada sem esperar a nova consulta, que confirma em seguida.
 * Na falha também recarrega: candidatura duplicada ou anúncio fechado mudam
 * o que o detalhe e o mural mostram.
 */
export function useCandidatarMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => candidatarAoAnuncio(anuncioId),
    onSuccess: (candidatura) => {
      queryClient.setQueryData<DetalheAnuncioMural>(
        chavesAnuncio.detalheMural(anuncioId),
        (atual) =>
          atual
            ? { ...atual, minhaCandidatura: { id: candidatura.id, status: candidatura.status } }
            : atual,
      );
    },
    // Sem `return`: a folha não espera a nova consulta pra fechar.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["anuncio", "mural"] });
    },
  });
}

export function useDetalheAnuncioMuralQuery(id: string) {
  return useQuery({
    queryKey: chavesAnuncio.detalheMural(id),
    queryFn: () => buscarDetalheAnuncioMural(id),
    // A situação da candidatura muda fora da tela (ex.: foi escolhido).
    staleTime: 0,
  });
}
export function useAnuncioQuery(id: string) {
  return useQuery({
    queryKey: chavesAnuncio.detalhe(id),
    queryFn: () => buscarAnuncio(id),
    // Mesmo motivo do painel; e os links das fotos são temporários.
    staleTime: 0,
  });
}

export function useCriarAnuncioMutation() {
  return useMutation({ mutationFn: criarAnuncio });
}

export function useAnexarFotoAnuncioMutation() {
  return useMutation({ mutationFn: anexarFotoAnuncio });
}

/** Tela 18 "Candidatos". Candidatos chegam e desistem fora da tela. */
export function useCandidatosQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAnuncio.candidatos(anuncioId),
    queryFn: () => listarCandidatos(anuncioId),
    staleTime: 0,
  });
}

/**
 * "Recusar candidatura" (tela 18b). A API devolve a lista já sem o recusado:
 * ela entra direto no cache, e o card some sem esperar outra consulta. O
 * detalhe (tela 16) e o painel contam candidatos, então são consultados de novo.
 */
export function useRecusarCandidatoMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidaturaId: string) => recusarCandidato({ anuncioId, candidaturaId }),
    onSuccess: (lista) => {
      queryClient.setQueryData<CandidatosResponse>(chavesAnuncio.candidatos(anuncioId), lista);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalhe(anuncioId) });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
    },
  });
}
