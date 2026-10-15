import { create } from "zustand";

const DURACAO_MS = 3000;

/**
 * Aviso curto que sobrevive à navegação (ex.: "Senha alterada" ao voltar pra
 * Ajustes). Fica num store porque quem dispara é a tela que está saindo; quem
 * mostra é o `Toast` montado no layout raiz.
 */
interface EstadoToast {
  mensagem: string | null;
  mostrar: (mensagem: string) => void;
  esconder: () => void;
}

let temporizador: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<EstadoToast>((set) => ({
  mensagem: null,
  mostrar: (mensagem) => {
    if (temporizador) {
      clearTimeout(temporizador);
    }
    set({ mensagem });
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
