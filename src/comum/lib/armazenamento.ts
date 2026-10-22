import * as SecureStore from "expo-secure-store";

/**
 * Armazenamento da sessão no aparelho (Keychain no iOS, Keystore no Android).
 * No navegador o Metro usa `armazenamento.web.ts`, porque o `expo-secure-store`
 * não tem implementação web.
 */
export function lerItem(chave: string): Promise<string | null> {
  return SecureStore.getItemAsync(chave);
}

export function salvarItem(chave: string, valor: string): Promise<void> {
  return SecureStore.setItemAsync(chave, valor);
}

export function removerItem(chave: string): Promise<void> {
  return SecureStore.deleteItemAsync(chave);
}
