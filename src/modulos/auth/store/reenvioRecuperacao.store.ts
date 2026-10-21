import { create } from "zustand";

export const ESPERA_REENVIO_S = 60;

/**
 * Espera entre pedidos do link de recuperação de senha. Fica num store, e não
 * no estado da tela, pra sobreviver a sair e voltar em "Esqueci minha senha":
 * o backend aceita poucos pedidos por hora e responde sucesso mesmo acima do
 * limite (anti-enumeração), então reabrir a tela não pode zerar a espera.
 */
interface ReenvioRecuperacao {
  /** Epoch em ms; `null` = pode enviar já. */
  proximoEnvioPermitidoEm: number | null;
  registrarEnvio: () => void;
}

export const useReenvioRecuperacao = create<ReenvioRecuperacao>((set) => ({
  proximoEnvioPermitidoEm: null,
  registrarEnvio: () =>
    set({ proximoEnvioPermitidoEm: Date.now() + ESPERA_REENVIO_S * 1000 }),
}));
