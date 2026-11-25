import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { erroApi } from "../../../comum/lib/erros";
import { CodigoErro } from "../../../comum/tipos/erros";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import type { AbaCandidatura, DecisaoReagendamento, ModoValidacao } from "../tipos/anuncio.enums";
import type {
  CandidatosResponse,
  DetalheAnuncioMural,
  FiltrosMural,
  MinhasCandidaturasResponse,
  ProporReagendamentoRequest,
  ServicoCombinado,
} from "../tipos/anuncio.types";
import {
  anexarFotoAnuncio,
  buscarAnuncio,
  buscarDetalheAnuncioMural,
  buscarServico,
  buscarValidacao,
  candidatarAoAnuncio,
  cancelarServicoPeloPrestador,
  listarCandidatos,
  recusarCandidato,
  buscarPainelEmpregador,
  buscarReagendamento,
  cancelarReagendamento,
  cancelarAnuncio,
  criarAnuncio,
  desistirCandidatura,
  editarAnuncio,
  enviarCheckout,
  escolherPrestador,
  iniciarServico,
  listarMinhasCandidaturas,
  listarMural,
  proporReagendamento,
  removerFotoAnuncio,
  responderReagendamento,
  validarServico,
} from "./anuncio.api";

export const chavesAnuncio = {
  painelEmpregador: ["anuncio", "painel-empregador"] as const,
  mural: (filtros: FiltrosMural) => ["anuncio", "mural", filtros] as const,
  totalMural: (filtros: FiltrosMural) => ["anuncio", "mural", "total", filtros] as const,
  detalheMural: (id: string) => ["anuncio", "mural", "detalhe", id] as const,
  detalhe: (id: string) => ["anuncio", "detalhe", id] as const,
  candidatos: (id: string) => ["anuncio", "candidatos", id] as const,
  servico: (id: string) => ["anuncio", "servico", id] as const,
  validacao: (id: string) => ["anuncio", "validacao", id] as const,
  reagendamento: (id: string) => ["anuncio", "reagendamento", id] as const,
  minhasCandidaturas: ["anuncio", "minhas-candidaturas"] as const,
  minhasCandidaturasDaAba: (aba: AbaCandidatura) =>
    ["anuncio", "minhas-candidaturas", aba] as const,
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

/**
 * "Salvar alterações" da tela 16a (ETI-62). A resposta já é o anúncio novo:
 * entra direto no cache da tela 16, que aparece atualizada ao voltar.
 */
export function useEditarAnuncioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editarAnuncio,
    onSuccess: (anuncio) => {
      queryClient.setQueryData(chavesAnuncio.detalhe(anuncio.id), anuncio);
    },
  });
}

export function useRemoverFotoAnuncioMutation() {
  return useMutation({ mutationFn: removerFotoAnuncio });
}

/** Tela 18 "Candidatos". Candidatos chegam e desistem fora da tela. */
export function useCandidatosQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAnuncio.candidatos(anuncioId),
    queryFn: () => listarCandidatos(anuncioId),
    staleTime: 0,
  });
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

/**
 * Tela 32 "Aplicações": uma lista paginada por aba. `staleTime: 0` faz trocar
 * de aba consultar de novo, como pede o card; a lista já vista aparece na hora.
 */
export function useMinhasCandidaturasQuery(aba: AbaCandidatura) {
  return useInfiniteQuery({
    queryKey: chavesAnuncio.minhasCandidaturasDaAba(aba),
    queryFn: ({ pageParam }) => listarMinhasCandidaturas(aba, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) =>
      ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined,
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

/**
 * "Confirmar escolha" (tela 23, ETI-70). Com sucesso ou falha, o que a tela
 * mostra pode ter mudado: na escolha, os candidatos encerram e o anúncio vira
 * "Combinado" no detalhe e no painel; num `409`, a lista é a que vale
 * (cota esgotada pede a lista recarregada, conflito quer dizer que outro
 * aparelho escolheu).
 */
export function useEscolherPrestadorMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidaturaId: string) => escolherPrestador({ anuncioId, candidaturaId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.candidatos(anuncioId) });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalhe(anuncioId) });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
    },
  });
}

/**
 * "Desistir da candidatura" (tela 32d). No sucesso o item sai de "Pendentes"
 * na hora; as abas e o mural (detalhe mostra a candidatura) consultam de novo
 * em seguida. Na falha também: o erro quer dizer que a situação mudou.
 */
export function useDesistirCandidaturaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidaturaId: string) => desistirCandidatura(candidaturaId),
    onSuccess: (_, candidaturaId) => {
      queryClient.setQueriesData<InfiniteData<MinhasCandidaturasResponse>>(
        { queryKey: chavesAnuncio.minhasCandidaturas },
        (atual) =>
          atual
            ? {
                ...atual,
                pages: atual.pages.map((pagina) => ({
                  ...pagina,
                  content: pagina.content.filter((item) => item.id !== candidaturaId),
                })),
              }
            : atual,
      );
    },
    // Sem `return`: a folha não espera a nova consulta pra fechar.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.minhasCandidaturas });
      void queryClient.invalidateQueries({ queryKey: ["anuncio", "mural"] });
    },
  });
}

/**
 * "Enviar check-out" (tela 38, ETI-90). No sucesso "Seu serviço" já volta em
 * "Aguardando validação" com o `checkoutEm` da resposta, e a consulta confirma
 * em seguida; a candidatura também muda de status, então "Aplicações" recarrega.
 * Com `SERVICO_NAO_ENCONTRADO` o Prestador deixou de ser o escolhido: o serviço
 * é zerado e consultado de novo (`reset`, não `remove`), porque a tela 37
 * continua montada embaixo e manteria contato e endereço; a nova consulta
 * devolve o 404 e ela troca pelo "não disponível".
 */
export function useCheckoutMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ arquivos, observacao }: { arquivos: ArquivoFoto[]; observacao: string }) =>
      enviarCheckout({ anuncioId, arquivos, observacao }),
    onSuccess: ({ status, checkoutEm }) => {
      queryClient.setQueryData<ServicoCombinado>(
        chavesAnuncio.servico(anuncioId),
        (atual) => (atual ? { ...atual, status, checkoutEm } : atual),
      );
    },
    onSettled: (_dados, falha) => {
      if (erroApi(falha)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO) {
        void queryClient.resetQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
        void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalheMural(anuncioId) });
        void queryClient.invalidateQueries({ queryKey: chavesAnuncio.minhasCandidaturas });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.minhasCandidaturas });
    },
  });
}

/**
 * Tela 27 "Validar serviço" (ETI-92/ETI-93). Os links das fotos do check-out
 * são temporários: consulta de novo a cada abertura.
 */
export function useValidacaoQuery(anuncioId: string) {
  return useQuery({
    queryKey: chavesAnuncio.validacao(anuncioId),
    queryFn: () => buscarValidacao(anuncioId),
    staleTime: 0,
  });
}

/**
 * "Validar serviço" (tela 27, ETI-92). No sucesso a tela 25, que fica embaixo,
 * já volta "Concluído" com o `validadoEm` da resposta, e a consulta confirma em
 * seguida; o painel e o detalhe do anúncio também mudam de status. Com
 * `SERVICO_NAO_ENCONTRADO` o serviço é zerado e consultado de novo (`reset`,
 * não `remove`), porque a tela 25 continua montada embaixo com contato e
 * endereço; a nova consulta devolve o 404 e ela troca pelo "não disponível".
 */
export function useValidarServicoMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (modo: ModoValidacao) => validarServico({ anuncioId, request: { modo } }),
    onSuccess: ({ status, validadoEm }) => {
      queryClient.setQueryData<ServicoCombinado>(
        chavesAnuncio.servico(anuncioId),
        (atual) => (atual ? { ...atual, status, validadoEm } : atual),
      );
    },
    onSettled: (_dados, falha) => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalhe(anuncioId) });
      if (erroApi(falha)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO) {
        void queryClient.resetQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
    },
  });
}

/**
 * "Cancelar serviço (Prestador)" (ETI-97). No sucesso as telas 36/37 já voltam
 * canceladas com o `status` da resposta, e a consulta confirma em seguida.
 * Com `SERVICO_NAO_ENCONTRADO` o serviço é zerado (`reset`), igual ao checkout.
 */
export function useCancelarServicoPeloPrestadorMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelarServicoPeloPrestador(anuncioId),
    onSuccess: ({ status }) => {
      queryClient.setQueryData<ServicoCombinado>(chavesAnuncio.servico(anuncioId), (atual) =>
        atual ? { ...atual, status } : atual,
      );
    },
    onSettled: (_dados, falha) => {
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.minhasCandidaturas });
      if (erroApi(falha)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO) {
        void queryClient.resetQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
    },
  });
}

/**
 * Tela 41: a proposta muda fora da tela (resposta, cancelamento, expiração),
 * então toda abertura consulta de novo.
 */
export function useReagendamentoQuery(reagendamentoId: string | null) {
  return useQuery({
    queryKey: chavesAnuncio.reagendamento(reagendamentoId ?? ""),
    queryFn: () => buscarReagendamento(reagendamentoId!),
    enabled: reagendamentoId !== null,
    staleTime: 0,
  });
}

/**
 * Encerrar ou criar uma proposta muda o aviso das telas 25/36 (e, no aceite,
 * a data do serviço e do painel). Na falha também recarrega: os `409` querem
 * dizer que o serviço ou a proposta mudaram.
 */
function recarregarDepoisDoReagendamento(
  queryClient: ReturnType<typeof useQueryClient>,
  anuncioId: string,
) {
  void queryClient.invalidateQueries({ queryKey: chavesAnuncio.servico(anuncioId) });
  void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
  void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalhe(anuncioId) });
  void queryClient.invalidateQueries({ queryKey: chavesAnuncio.minhasCandidaturas });
}

/** "Enviar proposta" da tela 40 (ETI-99). */
export function useProporReagendamentoMutation(anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ProporReagendamentoRequest) =>
      proporReagendamento({ anuncioId, request }),
    onSuccess: (proposta) => {
      queryClient.setQueryData(chavesAnuncio.reagendamento(proposta.id), proposta);
    },
    onSettled: () => recarregarDepoisDoReagendamento(queryClient, anuncioId),
  });
}

/** "Aceitar" e "Recusar" da tela 41: a resposta já é o serviço atualizado. */
export function useResponderReagendamentoMutation(reagendamentoId: string, anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decisao: DecisaoReagendamento) =>
      responderReagendamento({ reagendamentoId, decisao }),
    onSuccess: (servico) => {
      queryClient.setQueryData<ServicoCombinado>(chavesAnuncio.servico(anuncioId), servico);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: chavesAnuncio.reagendamento(reagendamentoId),
      });
      recarregarDepoisDoReagendamento(queryClient, anuncioId);
    },
  });
}

/** "Cancelar proposta" do proponente, na tela 41. */
export function useCancelarReagendamentoMutation(reagendamentoId: string, anuncioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelarReagendamento(reagendamentoId),
    onSuccess: (proposta) => {
      queryClient.setQueryData(chavesAnuncio.reagendamento(reagendamentoId), proposta);
    },
    onSettled: () => recarregarDepoisDoReagendamento(queryClient, anuncioId),
  });
}
