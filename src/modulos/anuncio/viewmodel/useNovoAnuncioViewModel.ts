import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useRascunhoAnuncio, type ErrosAnuncio } from "../store/rascunhoAnuncio.store";
import {
  DESCRICAO_MAX,
  FOTOS_MAX,
  PassoUmSchema,
  TITULO_MAX,
  TITULO_MIN,
} from "../tipos/anuncio.types";
import { useEscolhaDeFotos } from "./useEscolhaDeFotos";

export interface FotoExibida {
  chave: string;
  uri: string;
  /** Motivo da recusa; a foto recusada não é enviada. */
  erro: string | null;
}

/** Tela 14 "Novo anúncio" (1 de 2): categoria, título, descrição e fotos. */
export function useNovoAnuncioViewModel() {
  const router = useRouter();
  const rascunho = useRascunhoAnuncio((estado) => estado.rascunho);
  const erros = useRascunhoAnuncio((estado) => estado.erros);
  const alterar = useRascunhoAnuncio((estado) => estado.alterar);
  const adicionarFotos = useRascunhoAnuncio((estado) => estado.adicionarFotos);
  const removerFoto = useRascunhoAnuncio((estado) => estado.removerFoto);
  const definirErros = useRascunhoAnuncio((estado) => estado.definirErros);
  const descartar = useRascunhoAnuncio((estado) => estado.descartar);

  // Sair do fluxo (voltar daqui) descarta o rascunho. Ir pra 14a/15 não
  // desmonta esta tela, então o rascunho continua.
  useEffect(() => () => descartar(), [descartar]);

  const vagas = FOTOS_MAX - rascunho.fotos.length;

  const escolhaDeFotos = useEscolhaDeFotos({ vagas, aoEscolher: adicionarFotos });

  const aoContinuar = () => {
    const resultado = PassoUmSchema.safeParse({
      categoriaId: rascunho.categoria?.id,
      titulo: rascunho.titulo,
      descricao: rascunho.descricao,
    });
    const novosErros: ErrosAnuncio = {};
    if (!resultado.success) {
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] === "categoriaId" ? "categoria" : problema.path[0];
        if (campo === "categoria" || campo === "titulo" || campo === "descricao") {
          novosErros[campo] ??= problema.message;
        }
      }
    }
    if (rascunho.fotos.some((foto) => foto.erro)) {
      novosErros.fotos = "Remova as fotos recusadas para continuar.";
    }
    definirErros(novosErros);
    if (Object.keys(novosErros).length === 0) {
      router.push("/(app)/anuncio/novo/detalhes");
    }
  };

  const fotos: FotoExibida[] = rascunho.fotos.map((foto) => ({
    chave: foto.chave,
    uri: foto.previewUri,
    erro: foto.erro,
  }));

  return {
    categoria: rascunho.categoria?.nome ?? null,
    aoTrocarCategoria: () => router.push("/(app)/anuncio/novo/categoria"),
    titulo: rascunho.titulo,
    aoMudarTitulo: (texto: string) => alterar("titulo", texto),
    tituloDica: `obrigatório · ${TITULO_MIN} a ${TITULO_MAX} caracteres`,
    tituloMax: TITULO_MAX,
    descricao: rascunho.descricao,
    aoMudarDescricao: (texto: string) => alterar("descricao", texto),
    descricaoMax: DESCRICAO_MAX,
    fotos,
    fotosMax: FOTOS_MAX,
    ...escolhaDeFotos,
    aoRemoverFoto: removerFoto,
    erros,
    podeContinuar: !escolhaDeFotos.preparandoFotos,
    aoContinuar,
    aoVoltar: () => router.back(),
  };
}
