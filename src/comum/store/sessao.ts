import { create } from "zustand";

import {
  lerPapelSalvo,
  limparSessaoSalva,
  registrarEventosSessao,
  salvarPapelAtivo,
  salvarSessao,
} from "../lib/api";
import { queryClient } from "../lib/query";
import { PapelUsuario } from "../tipos/papel";
import type { TokensSessao } from "../tipos/sessao";

export const MENSAGEM_SESSAO_EXPIRADA = "Sua sessão expirou. Entre novamente.";

type StatusSessao = "carregando" | "autenticado" | "anonimo";

/**
 * Sessão do aparelho. Os tokens ficam no SecureStore (via `lib/api.ts`), não
 * aqui: o store só expõe o que a interface precisa decidir.
 */
interface EstadoSessao {
  status: StatusSessao;
  papelAtivo: PapelUsuario | null;
  /** Motivo de uma saída que o usuário não pediu (ex.: sessão encerrada em outro aparelho). */
  avisoSaida: string | null;
  restaurar: () => Promise<void>;
  entrar: (tokens: TokensSessao) => Promise<void>;
  sair: () => Promise<void>;
  definirPapelAtivo: (papel: PapelUsuario) => Promise<void>;
  limparAvisoSaida: () => void;
}

function papelValido(valor: string | null): PapelUsuario | null {
  return Object.values(PapelUsuario).find((papel) => papel === valor) ?? null;
}

export const useSessao = create<EstadoSessao>((set) => ({
  status: "carregando",
  papelAtivo: null,
  avisoSaida: null,
  restaurar: async () => {
    const papel = papelValido(await lerPapelSalvo());
    set(
      papel
        ? { status: "autenticado", papelAtivo: papel }
        : { status: "anonimo", papelAtivo: null },
    );
  },
  entrar: async (tokens) => {
    await salvarSessao(tokens);
    set({ status: "autenticado", papelAtivo: tokens.papel, avisoSaida: null });
  },
  sair: async () => {
    await limparSessaoSalva();
    queryClient.clear();
    // Saída pedida pelo usuário: apaga um aviso de expiração que o logout
    // possa ter disparado (ex.: sessão já revogada em outro aparelho).
    set({ status: "anonimo", papelAtivo: null, avisoSaida: null });
  },
  definirPapelAtivo: async (papel) => {
    await salvarPapelAtivo(papel);
    set({ papelAtivo: papel });
  },
  limparAvisoSaida: () => set({ avisoSaida: null }),
}));

registrarEventosSessao({
  // A renovação traz o papel atual da conta — pode ter mudado em outro aparelho.
  aoRenovar: (tokens) => useSessao.setState({ papelAtivo: tokens.papel }),
  aoExpirar: () => {
    queryClient.clear();
    useSessao.setState({
      status: "anonimo",
      papelAtivo: null,
      avisoSaida: MENSAGEM_SESSAO_EXPIRADA,
    });
  },
});
