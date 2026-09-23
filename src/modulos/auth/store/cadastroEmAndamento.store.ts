import { create } from "zustand";

import type { PapelUsuario } from "../tipos/auth.enums";

/**
 * Dados do cadastro em andamento, compartilhados entre os passos 1→3
 * (dados pessoais → confirmar celular → confirmar e-mail). Vive só dentro do
 * módulo `auth` — não é sessão autenticada, por isso não fica em `comum/store`.
 */
interface CadastroEmAndamento {
  nomeCompleto: string | null;
  email: string | null;
  celular: string | null;
  papelAtivo: PapelUsuario | null;
  telefoneConfirmado: boolean;
  iniciar: (dados: {
    nomeCompleto: string;
    email: string;
    celular: string;
    papelAtivo: PapelUsuario;
  }) => void;
  confirmarTelefone: () => void;
  trocarEmail: (email: string) => void;
  limpar: () => void;
}

export const useCadastroEmAndamento = create<CadastroEmAndamento>((set) => ({
  nomeCompleto: null,
  email: null,
  celular: null,
  papelAtivo: null,
  telefoneConfirmado: false,
  iniciar: (dados) => set({ ...dados, telefoneConfirmado: false }),
  confirmarTelefone: () => set({ telefoneConfirmado: true }),
  trocarEmail: (email) => set({ email }),
  limpar: () =>
    set({
      nomeCompleto: null,
      email: null,
      celular: null,
      papelAtivo: null,
      telefoneConfirmado: false,
    }),
}));
