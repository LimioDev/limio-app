import { create } from "zustand";

const DURACAO_MS = 3000;

export const TipoToast = {
  SUCESSO: "SUCESSO",
  ERRO: "ERRO",
} as const;

export type TipoToast = (typeof TipoToast)[keyof typeof TipoToast];

/**
 * Aviso curto que sobrevive à navegação (ex.: "Senha alterada" ao voltar pra
 * Ajustes). Fica num store porque quem dispara é a tela que está saindo; quem
 * mostra é o `Toast` montado no layout raiz.
 */
interface EstadoToast {
  mensagem: string | null;
  tipo: TipoToast;
  /** `tipo` padrão é sucesso; erro troca ícone e cor pra não parecer confirmação. */
  mostrar: (mensagem: string, tipo?: TipoToast) => void;
  esconder: () => void;
}

let temporizador: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<EstadoToast>((set) => ({
  mensagem: null,
  tipo: TipoToast.SUCESSO,
  mostrar: (mensagem, tipo = TipoToast.SUCESSO) => {
    if (temporizador) {
      clearTimeout(temporizador);
    }
    set({ mensagem, tipo });
    temporizador = setTimeout(() => {
      temporizador = null;
      set({ mensagem: null });
    }, DURACAO_MS);
  },
  esconder: () => {
    if (temporizador) {
      clearTimeout(temporizador);
      temporizador = null;
    }
    set({ mensagem: null });
  },
}));
