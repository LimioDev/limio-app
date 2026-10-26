import { create } from "zustand";

import type { Categoria } from "../../../comum/tipos/categoria";
import type { CamposEnderecoForm } from "../../../comum/tipos/endereco";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import type { MunicipioEscolhido } from "../../../comum/tipos/localidade";

/** Foto escolhida no passo 1. Recusada no preparo: fica na tela com o motivo, sem `arquivo`. */
export interface FotoRascunho {
  chave: string;
  /** URI da imagem pra miniatura (a original, antes do preparo). */
  previewUri: string;
  arquivo: ArquivoFoto | null;
  erro: string | null;
}

export type EnderecoEscolhido =
  | { tipo: "salvo"; id: string }
  | { tipo: "avulso"; campos: CamposEnderecoForm };

export interface RascunhoAnuncio {
  categoria: Categoria | null;
  titulo: string;
  descricao: string;
  fotos: FotoRascunho[];
  data: string;
  hora: string;
  /** `null` até escolher: a tela 15 mostra o endereço padrão como marcado. */
  endereco: EnderecoEscolhido | null;
  /** Endereço avulso digitado, guardado mesmo se outro for marcado depois. */
  avulso: CamposEnderecoForm | null;
  tamanhoLocal: string;
  numeroPessoas: string;
  observacoes: string;
}

/** Erro por campo das telas 14 e 15 — da validação local ou do `CodigoErro` da API. */
export type ErrosAnuncio = Partial<
  Record<
    | "categoria"
    | "titulo"
    | "descricao"
    | "fotos"
    | "data"
    | "hora"
    | "endereco"
    | "tamanhoLocal"
    | "numeroPessoas"
    | "observacoes",
    string
  >
>;

type CampoRascunho = Exclude<keyof RascunhoAnuncio, "fotos" | "avulso">;

const RASCUNHO_VAZIO: RascunhoAnuncio = {
  categoria: null,
  titulo: "",
  descricao: "",
  fotos: [],
  data: "",
  hora: "",
  endereco: null,
  avulso: null,
  tamanhoLocal: "",
  numeroPessoas: "",
  observacoes: "",
};

/**
 * Anúncio em criação (telas 14, 14a e 15 e o endereço avulso). Cada tela
 * escreve aqui, então o passo 1 continua preenchido ao voltar do passo 2; só o
 * "Publicar no mural" manda pra API. Mudar um campo apaga o erro dele. Sair do
 * fluxo pelo passo 1 descarta.
 */
interface EstadoRascunhoAnuncio {
  rascunho: RascunhoAnuncio;
  erros: ErrosAnuncio;
  /** Ponte com o seletor de cidade do endereço avulso, que é outra tela. */
  cidadeAvulso: MunicipioEscolhido | null;
  alterar: <C extends CampoRascunho>(campo: C, valor: RascunhoAnuncio[C]) => void;
  adicionarFotos: (fotos: FotoRascunho[]) => void;
  removerFoto: (chave: string) => void;
  usarAvulso: (campos: CamposEnderecoForm) => void;
  definirCidadeAvulso: (cidade: MunicipioEscolhido | null) => void;
  definirErros: (erros: ErrosAnuncio) => void;
  descartar: () => void;
}

export const useRascunhoAnuncio = create<EstadoRascunhoAnuncio>((set) => ({
  rascunho: RASCUNHO_VAZIO,
  erros: {},
  cidadeAvulso: null,
  alterar: (campo, valor) =>
    set((estado) => ({
      rascunho: { ...estado.rascunho, [campo]: valor },
      // A data e a hora formam um instante só: mexer numa vale pras duas.
      erros:
        campo === "data" || campo === "hora"
          ? { ...estado.erros, data: undefined, hora: undefined }
          : { ...estado.erros, [campo]: undefined },
    })),
  adicionarFotos: (fotos) =>
    set((estado) => ({
      rascunho: { ...estado.rascunho, fotos: [...estado.rascunho.fotos, ...fotos] },
      erros: { ...estado.erros, fotos: undefined },
    })),
  removerFoto: (chave) =>
    set((estado) => ({
      rascunho: {
        ...estado.rascunho,
        fotos: estado.rascunho.fotos.filter((foto) => foto.chave !== chave),
      },
      erros: { ...estado.erros, fotos: undefined },
    })),
  usarAvulso: (campos) =>
    set((estado) => ({
      rascunho: {
        ...estado.rascunho,
        avulso: campos,
        endereco: { tipo: "avulso", campos },
      },
      erros: { ...estado.erros, endereco: undefined },
    })),
  definirCidadeAvulso: (cidadeAvulso) => set({ cidadeAvulso }),
  definirErros: (erros) => set({ erros }),
  descartar: () => set({ rascunho: RASCUNHO_VAZIO, erros: {}, cidadeAvulso: null }),
}));
