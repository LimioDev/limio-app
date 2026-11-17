import {
  descartarUltimoToquePush,
  esquecerTokenPush,
  garantirPermissaoPush,
  obterTokenPush,
  PLATAFORMA_PUSH,
  PUSH_SUPORTADO,
  tokenPushParaRemover,
} from "../lib/push";
import { registrarAparelhoPush, removerAparelhoPush } from "./aparelhoPush.api";

/** O logout não espera mais que isso pela remoção do aparelho. */
const LIMITE_REMOCAO_MS = 5000;

/**
 * "Registrar aparelho para push" (ETI-113): pede a permissão se ainda não
 * pediu e, com ela, manda o token pro back. Devolve `true` se registrou.
 * Nunca lança: sem permissão, sem rede ou sem token, o app tenta de novo na
 * próxima abertura, sem mostrar erro.
 */
export async function registrarEsteAparelho(): Promise<boolean> {
  if (!PUSH_SUPORTADO) {
    return false;
  }
  try {
    if (!(await garantirPermissaoPush())) {
      return false;
    }
    const token = await obterTokenPush();
    await registrarAparelhoPush({ token, plataforma: PLATAFORMA_PUSH });
    return true;
  } catch {
    return false;
  }
}

/**
 * "Remover aparelho" no logout, antes de limpar a sessão (precisa do token de
 * acesso). Melhor esforço com prazo: falhou ou demorou, o logout segue — se o
 * aparelho ficar registrado, o próximo login nele passa o push pra nova conta.
 * Também descarta o último toque, pra não abrir na próxima conta.
 */
export async function removerEsteAparelho(): Promise<void> {
  const remover = async () => {
    const token = await tokenPushParaRemover();
    if (token) {
      await removerAparelhoPush(token);
    }
  };
  try {
    await Promise.race([
      remover(),
      new Promise((resolver) => setTimeout(resolver, LIMITE_REMOCAO_MS)),
    ]);
  } catch {
    // Sem rede ou token indisponível: segue pro logout.
  } finally {
    esquecerTokenPush();
    descartarUltimoToquePush();
  }
}
