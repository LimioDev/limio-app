import { create } from "zustand";

import type { Categoria } from "../../../comum/tipos/categoria";
import type { FotoRascunho } from "./rascunhoAnuncio.store";

/**
 * Foto na tela 16a: uma que o anúncio já tem (`chave` é o id dela na API) ou
 * uma escolhida agora, que só sobe no "Salvar alterações".
 */
export type FotoEdicao =
  | { tipo: "salva"; chave: string; uri: string }
  | ({ tipo: "nova" } & FotoRascunho);

export interface FormularioEdicao {
  categoria: Categoria | null;
  titulo: string;
  descricao: string;
  fotos: FotoEdicao[];
  data: string;
  hora: string;
  tamanhoLocal: string;
  numeroPessoas: string;
  observacoes: string;
}

/** Erro por campo da tela 16a — da validação local ou do `CodigoErro` da API. */
export type ErrosEdicao = Partial<
  Record<
    | "categoria"
    | "titulo"
    | "descricao"
    | "fotos"
    | "data"
    | "hora"
    | "tamanhoLocal"
    | "numeroPessoas"
    | "observacoes",
    string
  >
>;

type CampoFormulario = Exclude<keyof FormularioEdicao, "fotos">;

const FORMULARIO_VAZIO: FormularioEdicao = {
  categoria: null,
  titulo: "",
  descricao: "",
  fotos: [],
  data: "",
  hora: "",
  tamanhoLocal: "",
  numeroPessoas: "",
  observacoes: "",
};

/**
 * Anúncio em edição (telas 16a e a 14a aberta dela). Fica num store, e não no
 * ViewModel, porque a categoria é escolhida em outra tela. `anuncioId` diz de
 * qual anúncio é o formulário; `fotosOriginais` são os ids das fotos ao abrir,
 * pra saber quais o usuário tirou. Mudar um campo apaga o erro dele. Sair da
 * tela 16a descarta.
 */
interface EstadoEdicaoAnuncio {
  anuncioId: string | null;
  formulario: FormularioEdicao;
  fotosOriginais: string[];
  erros: ErrosEdicao;
  iniciar: (anuncioId: string, formulario: FormularioEdicao) => void;
  alterar: <C extends CampoFormulario>(campo: C, valor: FormularioEdicao[C]) => void;
  adicionarFotos: (fotos: FotoRascunho[]) => void;
  removerFoto: (chave: string) => void;
  definirErros: (erros: ErrosEdicao) => void;
  descartar: () => void;
}

export const useEdicaoAnuncio = create<EstadoEdicaoAnuncio>((set) => ({
  anuncioId: null,
  formulario: FORMULARIO_VAZIO,
  fotosOriginais: [],
  erros: {},
  iniciar: (anuncioId, formulario) =>
    set({
      anuncioId,
      formulario,
      fotosOriginais: formulario.fotos.filter((f) => f.tipo === "salva").map((f) => f.chave),
      erros: {},
    }),
  alterar: (campo, valor) =>
    set((estado) => ({
      formulario: { ...estado.formulario, [campo]: valor },
      // A data e a hora formam um instante só: mexer numa vale pras duas.
      erros:
        campo === "data" || campo === "hora"
          ? { ...estado.erros, data: undefined, hora: undefined }
          : { ...estado.erros, [campo]: undefined },
    })),
  adicionarFotos: (fotos) =>
    set((estado) => ({
      formulario: {
        ...estado.formulario,
        fotos: [
          ...estado.formulario.fotos,
          ...fotos.map((foto): FotoEdicao => ({ tipo: "nova", ...foto })),
        ],
      },
      erros: { ...estado.erros, fotos: undefined },
    })),
  removerFoto: (chave) =>
    set((estado) => ({
      formulario: {
        ...estado.formulario,
        fotos: estado.formulario.fotos.filter((foto) => foto.chave !== chave),
      },
      erros: { ...estado.erros, fotos: undefined },
    })),
  definirErros: (erros) => set({ erros }),
  descartar: () =>
    set({ anuncioId: null, formulario: FORMULARIO_VAZIO, fotosOriginais: [], erros: {} }),
}));
