import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { recursoAindaExiste } from "../servico/notificacao.api";
import { useMarcarComoLidaMutation } from "../servico/notificacao.queries";
import type { Notificacao } from "../tipos/notificacao.types";
import { destinoDaNotificacao } from "./destinoNotificacao";

const ROTULO_PAPEL: Record<PapelDoApp, string> = {
  [PapelUsuario.EMPREGADOR]: "Empregador",
  [PapelUsuario.PRESTADOR]: "Prestador",
};

export interface AlvoNotificacao extends Pick<Notificacao, "id" | "tipo" | "anuncioId"> {
  /** `false` evita marcar de novo o que já está lido. */
  naoLida: boolean;
}

/**
 * Abre a tela ligada à notificação: item da tela 43 (ETI-111) e toque no push
 * ou no banner (ETI-113) seguem o mesmo caminho. Marca como lida, confere o
 * papel e se o anúncio ainda existe. `semDestino` roda quando o tipo não tem tela.
 */
export function useAbrirNotificacao() {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const usuarioId = useSessao((estado) => estado.usuarioId);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const { mutate: marcarComoLida } = useMarcarComoLidaMutation();
  const [abrindoId, setAbrindoId] = useState<string | null>(null);
  // Ref além do estado: dois toques no mesmo render passariam pelo estado antigo.
  const abrindo = useRef(false);

  const abrir = useCallback(
    async (alvo: AlvoNotificacao, semDestino?: () => void) => {
      if (abrindo.current) {
        return;
      }
      // Marca em paralelo com a abertura: uma falha aqui não impede de abrir,
      // e a bolinha volta a sumir na próxima consulta que der certo.
      if (alvo.naoLida) {
        marcarComoLida(alvo.id);
      }

      const destino = destinoDaNotificacao(alvo, { papelAtivo, usuarioId });
      if (!destino) {
        semDestino?.();
        return;
      }
      if (destino.papel && destino.papel !== papelAtivo) {
        mostrarToast(
          `Troque para o papel de ${ROTULO_PAPEL[destino.papel]} para abrir esta notificação.`,
          TipoToast.ERRO,
        );
        return;
      }
      if (destino.conferir) {
        abrindo.current = true;
        setAbrindoId(alvo.id);
        const existe = await recursoAindaExiste(destino.conferir.caminho);
        abrindo.current = false;
        setAbrindoId(null);
        if (!existe) {
          mostrarToast(destino.conferir.mensagemSeSumiu, TipoToast.ERRO);
          return;
        }
      }
      router.push(destino.rota);
    },
    [marcarComoLida, papelAtivo, usuarioId, mostrarToast, router],
  );

  return { abrir, abrindoId };
}
