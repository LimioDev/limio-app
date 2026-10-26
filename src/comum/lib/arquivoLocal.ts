import { File as ArquivoDoAparelho } from "expo-file-system";

export interface ArquivoLocal {
  tamanhoBytes: number;
  /** Só no web: o `FormData` do navegador precisa do conteúdo, não da URI. */
  conteudo?: Blob;
}

/**
 * Nativo (Android/iOS): tamanho do arquivo gravado pelo `expo-file-system`.
 * `0` se não existe ou não dá pra ler, e aí o schema recusa o envio.
 * No web vale `arquivoLocal.web.ts`.
 */
export async function lerArquivoLocal(uri: string): Promise<ArquivoLocal> {
  return { tamanhoBytes: new ArquivoDoAparelho(uri).size };
}
