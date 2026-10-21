import { create } from "zustand";

import {
  RAIO_PADRAO_KM,
  type Categoria,
  type JanelaAtendimento,
  type PerfilAtuacaoResponse,
} from "../tipos/atuacao.types";
import type { Uf } from "../tipos/perfil.enums";

export interface MunicipioEscolhido {
  nome: string;
  uf: Uf;
}

export interface RascunhoAtuacao {
  especialidades: Categoria[];
  raioAtendimentoKm: number;
  municipio: MunicipioEscolhido | null;
  janelas: JanelaAtendimento[];
}

/** Erro por campo da tela 10 — da validação local ou do `CodigoErro` da API. */
export interface ErrosAtuacao {
  especialidades?: string;
  raio?: string;
  municipio?: string;
  janelas?: string;
}

/**
 * Edição em andamento da tela 10 "Perfil de atuação". As subtelas
 * (Especialidades, Município-base, Janelas de horário) escrevem aqui; só o
 * "Salvar" da tela 10 manda pra API. Mudar um campo apaga o erro dele.
 */
interface EstadoRascunhoAtuacao {
  rascunho: RascunhoAtuacao | null;
  erros: ErrosAtuacao;
  iniciar: (perfil: PerfilAtuacaoResponse) => void;
  definirEspecialidades: (especialidades: Categoria[]) => void;
  definirRaio: (raioAtendimentoKm: number) => void;
  definirMunicipio: (municipio: MunicipioEscolhido) => void;
  definirJanelas: (janelas: JanelaAtendimento[]) => void;
  definirErros: (erros: ErrosAtuacao) => void;
  descartar: () => void;
}

export const useRascunhoAtuacao = create<EstadoRascunhoAtuacao>((set) => {
  const alterar = (
    campo: keyof ErrosAtuacao,
    mudanca: Partial<RascunhoAtuacao>,
  ) =>
    set((estado) =>
      estado.rascunho
        ? {
            rascunho: { ...estado.rascunho, ...mudanca },
            erros: { ...estado.erros, [campo]: undefined },
          }
        : estado,
    );

  return {
    rascunho: null,
    erros: {},
    iniciar: (perfil) =>
      set({
        rascunho: {
          especialidades: perfil.especialidades,
          raioAtendimentoKm: perfil.raioAtendimentoKm ?? RAIO_PADRAO_KM,
          municipio:
            perfil.municipioBase && perfil.ufBase
              ? { nome: perfil.municipioBase, uf: perfil.ufBase }
              : null,
          janelas: perfil.janelas,
        },
        erros: {},
      }),
    definirEspecialidades: (especialidades) =>
      alterar("especialidades", { especialidades }),
    definirRaio: (raioAtendimentoKm) => alterar("raio", { raioAtendimentoKm }),
    definirMunicipio: (municipio) => alterar("municipio", { municipio }),
    definirJanelas: (janelas) => alterar("janelas", { janelas }),
    definirErros: (erros) => set({ erros }),
    descartar: () => set({ rascunho: null, erros: {} }),
  };
});
