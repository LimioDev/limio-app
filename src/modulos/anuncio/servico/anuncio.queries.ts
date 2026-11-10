import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { erroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import type {
  DetalheAnuncioMural,
  FiltrosMural,
  ServicoCombinado,
} from "../tipos/anuncio.types";
import {
  anexarFotoAnuncio,
  buscarAnuncio,
  buscarDetalheAnuncioMural,
  buscarServico,
  candidatarAoAnuncio,
  buscarPainelEmpregador,
  cancelarAnuncio,
  criarAnuncio,
  iniciarServico,
  listarMural,
} from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
  mural: (filtros: FiltrosMural) => ["anuncio", "mural", filtros] as const,
  totalMural: (filtros: FiltrosMural) => ["anuncio", "mural", "total", filtros] as const,
  detalheMural: (id: string) => ["anuncio", "mural", "detalhe", id] as const,
  detalhe: (id: string) => ["anuncio", "detalhe", id] as const,
  servico: (id: string) => ["anuncio", "servico", id] as const,
};

/** Tela 36/37 "Seu serviço". Os links da foto são temporários e o estado muda fora da tela. */
export function useServicoQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAnuncio.servico(anuncioId),
    queryFn: () => buscarServico(anuncioId),
    staleTime: 0,
  });
}

/**
 * "Iniciar serviço" (ETI-88). No sucesso a tela já passa pra "em andamento"
 * com o `iniciadoEm` da resposta e a consulta confirma em seguida. Na falha
 * também recarrega: `SERVICO_ESTADO_INVALIDO` quer dizer que o estado mudou.
 * Com `SERVICO_NAO_ENCONTRADO` o Prestador deixou de ser o escolhido: o serviço
 * sai do cache (contato e endereço são só das partes) e o detalhe do anúncio
 * recarrega pra tirar o "Ver seu serviço".
 */
export function useIniciarServicoMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => iniciarServico(anuncioId),
    onSuccess: ({ status, iniciadoEm }) => {
      queryClient.setQueryData<ServicoCombinado>(
        chavesAnuncio.servico(anuncioId),
        (atual) => (atual ? { ...atual, status, iniciadoEm } : atual),
      );
    },
    onSettled: (_dados, falha) => {
      if (erroApi(falha)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO) {
        queryClient.removeQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
        void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalheMural(anuncioId) });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
    },
  });
}

export function usePainelEmpregadorQuery() {
  return useQuery({
    queryKey: chavesAnuncio.painelEmpregador,
    queryFn: buscarPainelEmpregador,
    // Candidatos chegam o tempo todo. A nova consulta ao voltar pra tela
    // (aba já montada) fica no `useFocusEffect` do ViewModel.
    staleTime: 0,
  });
}

/**
 * O prestador escolhido de um anúncio do Empregador, lido do painel do Início
 * (`AnuncioPainelResponse.prestadorEscolhido`), porque o detalhe ainda não
 * traz o campo. `undefined` enquanto o painel não carregou (ou falhou); `null`
 * sem escolhido ou fora da lista do painel (só lista anúncios abertos).
 */
export function usePrestadorEscolhidoNoPainelQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAnuncio.painelEmpregador,
    queryFn: buscarPainelEmpregador,
    staleTime: 0,
    select: (painel) =>
      painel.anuncios.find((a) => a.id === anuncioId)?.prestadorEscolhido ?? null,
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

export function useCancelarAnuncioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarAnuncio,
    // A tela 13 deixa de listar o anúncio. Sem `await`: a volta pro Início
    // não espera a nova consulta do painel.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
    },
  });
}
