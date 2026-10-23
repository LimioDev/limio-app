import type { ArquivoLocal } from "./arquivoLocal";

/**
 * Web: o manipulador devolve uma URI `blob:`/`data:`. O `fetch` dá o tamanho e
 * o conteúdo que vai no `FormData` (o `expo-file-system` não roda no web).
 */
export async function lerArquivoLocal(uri: string): Promise<ArquivoLocal> {
  const conteudo = await (await fetch(uri)).blob();
  return { tamanhoBytes: conteudo.size, conteudo };
}
