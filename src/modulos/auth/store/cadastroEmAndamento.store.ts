import { create } from "zustand";

import type { PapelUsuario } from "../../../comum/tipos/papel";

/**
 * Dados do cadastro em andamento, compartilhados entre os passos 1→2
 * (dados pessoais → confirmar e-mail). Vive só dentro do módulo `auth` — não é
 * sessão autenticada, por isso não fica em `comum/store`. Confirmação de
 * celular (UC04) saiu de escopo em definitivo (ETI-134/ETI-135): telefone não
 * tem etapa própria no cadastro.
 */
interface CadastroEmAndamento {
  nomeCompleto: string | null;
  email: string | null;
  celular: string | null;
  papelAtivo: PapelUsuario | null;
  iniciar: (dados: {
    nomeCompleto: string;
    email: string;
    celular: string;
    papelAtivo: PapelUsuario;
  }) => void;
  trocarEmail: (email: string) => void;
  limpar: () => void;
}

export const useCadastroEmAndamento = create<CadastroEmAndamento>((set) => ({
  nomeCompleto: null,
  email: null,
  celular: null,
  papelAtivo: null,
  iniciar: (dados) => set(dados),
  trocarEmail: (email) => set({ email }),
  limpar: () =>
    set({
      nomeCompleto: null,
      email: null,
      celular: null,
      papelAtivo: null,
    }),
}));
