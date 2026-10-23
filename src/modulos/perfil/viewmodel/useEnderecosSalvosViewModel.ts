import { useRouter } from "expo-router";
import { useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useToast } from "../../../comum/store/toast";
import { linhaLocal, linhaLogradouro } from "../servico/endereco.helpers";
import {
  useEnderecosQuery,
  useMarcarEnderecoPadraoMutation,
  useRemoverEnderecoMutation,
} from "../servico/endereco.queries";

export interface EnderecoExibido {
  id: string;
  apelido: string;
  /** "R. Cardeal Arcoverde, 1424 · ap 82". */
  logradouro: string;
  /** "Pinheiros · São Paulo · SP". */
  local: string;
  isPadrao: boolean;
}

/** Tela 09 "Endereços salvos": lista na ordem da API e as ações de cada endereço. */
export function useEnderecosSalvosViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useEnderecosQuery();
  const remover = useRemoverEnderecoMutation();
  const marcarPadrao = useMarcarEnderecoPadraoMutation();
  const [paraRemover, setParaRemover] = useState<EnderecoExibido | null>(null);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const enderecos: EnderecoExibido[] = (query.data ?? []).map((e) => ({
    id: e.id,
    apelido: e.apelido,
    logradouro: linhaLogradouro(e),
    local: linhaLocal(e),
    isPadrao: e.isPadrao,
  }));

  async function executar(id: string, acao: () => Promise<unknown>, falha: string) {
    setErroAcao(null);
    setOcupadoId(id);
    try {
      await acao();
      return true;
    } catch (erro) {
      // Inclui o futuro ENDERECO_EM_USO: a API explica por que não dá pra remover.
      setErroAcao(mensagemErroApi(erro, falha));
      return false;
    } finally {
      setOcupadoId(null);
    }
  }

  const abrirFormulario = (id?: string) =>
    router.push(
      id
        ? { pathname: "/(app)/conta/endereco", params: { id } }
        : "/(app)/conta/endereco",
    );

  return {
    carregando: query.isPending,
    erroCarregamento:
      query.isError && !query.data
        ? mensagemErroApi(query.error, "Não foi possível carregar seus endereços.")
        : null,
    atualizando: query.isRefetching && ocupadoId === null,
    aoAtualizar: () => {
      void query.refetch();
    },
    enderecos,
    ocupadoId,
    erroAcao,
    aoNovo: () => abrirFormulario(),
    aoEditar: (id: string) => abrirFormulario(id),
    aoTornarPadrao: (id: string) => {
      void executar(
        id,
        () => marcarPadrao.mutateAsync(id),
        "Não foi possível marcar o endereço como padrão. Tente novamente.",
      );
    },
    aoPedirRemocao: (endereco: EnderecoExibido) => setParaRemover(endereco),
    paraRemover,
    aoCancelarRemocao: () => setParaRemover(null),
    aoConfirmarRemocao: async () => {
      if (!paraRemover) {
        return;
      }
      const { id, apelido } = paraRemover;
      setParaRemover(null);
      const removido = await executar(
        id,
        () => remover.mutateAsync(id),
        "Não foi possível remover o endereço. Tente novamente.",
      );
      if (removido) {
        mostrarToast(`Endereço "${apelido}" removido`);
      }
    },
    aoVoltar: () => router.back(),
  };
}
