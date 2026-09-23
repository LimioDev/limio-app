import { create } from "zustand";

import { limparTokens, salvarTokens } from "../lib/api";
import type { Papel, TokensAutenticacao, Usuario } from "../tipos/api";

interface EstadoSessao {
  usuario: Usuario | null;
  papelAtivo: Papel | null;
  entrar: (
    usuario: Usuario,
    tokens: TokensAutenticacao,
    papelAtivo: Papel,
  ) => Promise<void>;
  sair: () => Promise<void>;
  alternarPapel: (papel: Papel) => void;
}

export const useSessao = create<EstadoSessao>((set) => ({
  usuario: null,
  papelAtivo: null,
  entrar: async (usuario, tokens, papelAtivo) => {
    await salvarTokens(tokens);
    set({ usuario, papelAtivo });
  },
  sair: async () => {
    await limparTokens();
    set({ usuario: null, papelAtivo: null });
  },
  alternarPapel: (papel) => set({ papelAtivo: papel }),
}));
