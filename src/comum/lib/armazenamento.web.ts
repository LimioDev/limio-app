/**
 * Versão web de `armazenamento.ts`. O navegador não tem cofre seguro como o
 * Keychain/Keystore, então a sessão fica no `localStorage`. Serve para
 * desenvolvimento e testes no navegador; o app de produção roda nativo.
 */
export async function lerItem(chave: string): Promise<string | null> {
  return globalThis.localStorage?.getItem(chave) ?? null;
}

export async function salvarItem(chave: string, valor: string): Promise<void> {
  globalThis.localStorage?.setItem(chave, valor);
}

export async function removerItem(chave: string): Promise<void> {
  globalThis.localStorage?.removeItem(chave);
}
