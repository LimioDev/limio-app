import { create } from "zustand";

import type { MunicipioEscolhido } from "../../../comum/tipos/localidade";

/**
 * Ponte entre o formulário "Novo endereço" e o seletor de cidade, que é outra
 * tela. O formulário grava a cidade atual antes de abrir o seletor; o seletor
 * grava a escolhida e volta; o formulário copia pro campo.
 */
interface EstadoCidadeEndereco {
  cidade: MunicipioEscolhido | null;
  definir: (cidade: MunicipioEscolhido | null) => void;
}

export const useCidadeEndereco = create<EstadoCidadeEndereco>((set) => ({
  cidade: null,
  definir: (cidade) => set({ cidade }),
}));
