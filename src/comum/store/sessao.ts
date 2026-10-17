import { create } from "zustand";

import {
  lerPapelSalvo,
  limparSessaoSalva,
  registrarEventosSessao,
  salvarPapelAtivo,
  salvarSessao,
} from "../lib/api";
import { queryClient } from "../lib/query";
import { ehPapelDoApp, type PapelDoApp } from "../tipos/papel";
import type { TokensSessao } from "../tipos/sessao";

export const MENSAGEM_SESSAO_EXPIRADA = "Sua sessão expirou. Entre novamente.";
export const MENSAGEM_PAPEL_SEM_ACESSO =
  "Contas de administrador não acessam o app. Use o painel administrativo.";

type StatusSessao = "carregando" | "autenticado" | "anonimo";

/**
 * Sessão do aparelho. Os tokens ficam no SecureStore (via `lib/api.ts`), não
 * aqui: o store só expõe o que a interface precisa decidir.
 *
 * `autenticado` sempre vem com `papelAtivo` de um papel do app — sessão de
 * `ADMIN` nunca chega a ser aberta (ver `ehPapelDoApp`).
 */
interface EstadoSessao {
  status: StatusSessao;
  papelAtivo: PapelDoApp | null;
  /** Motivo de uma saída que o usuário não pediu (ex.: sessão encerrada em outro aparelho). */
  avisoSaida: string | null;
  restaurar: () => Promise<void>;
  /** Recusa (lança) tokens de um papel que o app não atende — confira com `ehPapelDoApp` antes. */
  entrar: (tokens: TokensSessao) => Promise<void>;
  sair: () => Promise<void>;
  /** Saída que o usuário não pediu: a API recusou a sessão (revogada, vencida). */
  expirar: () => Promise<void>;
  definirPapelAtivo: (papel: PapelDoApp) => Promise<void>;
  limparAvisoSaida: () => void;
}

const ANONIMO = { status: "anonimo", papelAtivo: null } as const;

export const useSessao = create<EstadoSessao>((set) => ({
  status: "carregando",
  papelAtivo: null,
  avisoSaida: null,
  restaurar: async () => {
    const papel = await lerPapelSalvo();
    if (ehPapelDoApp(papel)) {
      set({ status: "autenticado", papelAtivo: papel });
      return;
    }
    // Sessão salva de um papel fora do app não serve: descarta em vez de deixar
    // o refresh token parado no aparelho.
    if (papel) {
      await limparSessaoSalva();
    }
    set(ANONIMO);
  },
  entrar: async (tokens) => {
    if (!ehPapelDoApp(tokens.papel)) {
      throw new Error(`Papel ${tokens.papel} não acessa o app.`);
    }
    await salvarSessao(tokens);
    set({ status: "autenticado", papelAtivo: tokens.papel, avisoSaida: null });
  },
  sair: async () => {
    await limparSessaoSalva();
    queryClient.clear();
    // Saída pedida pelo usuário: apaga um aviso de expiração que o logout
    // possa ter disparado (ex.: sessão já revogada em outro aparelho).
    set({ ...ANONIMO, avisoSaida: null });
  },
  expirar: async () => {
    await limparSessaoSalva();
    derrubarSessao(MENSAGEM_SESSAO_EXPIRADA);
  },
  definirPapelAtivo: async (papel) => {
    await salvarPapelAtivo(papel);
    set({ papelAtivo: papel });
  },
  limparAvisoSaida: () => set({ avisoSaida: null }),
}));

function derrubarSessao(avisoSaida: string): void {
  queryClient.clear();
  useSessao.setState({ ...ANONIMO, avisoSaida });
}

registrarEventosSessao({
  // A renovação traz o papel atual da conta — pode ter mudado em outro aparelho.
  aoRenovar: (tokens) => {
    if (ehPapelDoApp(tokens.papel)) {
      useSessao.setState({ papelAtivo: tokens.papel });
      return;
    }
    limparSessaoSalva()
      .catch(() => {})
      .finally(() => derrubarSessao(MENSAGEM_PAPEL_SEM_ACESSO));
  },
  aoExpirar: () => derrubarSessao(MENSAGEM_SESSAO_EXPIRADA),
});
