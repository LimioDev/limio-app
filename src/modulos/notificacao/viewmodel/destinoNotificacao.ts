import type { Href } from "expo-router";

import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";
import { TipoNotificacao } from "../tipos/notificacao.enums";
import type { Notificacao } from "../tipos/notificacao.types";

export interface DestinoNotificacao {
  rota: Href;
  /**
   * Papel em que a tela faz sentido (as do Empregador ficam atrás do guard do
   * papel). `null` = qualquer um.
   */
  papel: PapelDoApp | null;
  /** GET que confirma que o anúncio/serviço ainda existe; `null` = não precisa. */
  conferir: string | null;
}

interface Contexto {
  papelAtivo: PapelDoApp | null;
  usuarioId: string | null;
}

/**
 * Tela que abre ao tocar na notificação (tela 43), pelo tipo devolvido pela
 * API. `null` = só marca como lida e fica na lista (tipo sem tela ligada,
 * tipo que o app não conhece ou anúncio que não veio).
 */
export function destinoDaNotificacao(
  { tipo, anuncioId }: Pick<Notificacao, "tipo" | "anuncioId">,
  { papelAtivo, usuarioId }: Contexto,
): DestinoNotificacao | null {
  if (tipo === null) {
    return null;
  }

  // Tipos que não dependem do anúncio.
  switch (tipo) {
    case TipoNotificacao.CANDIDATURA_RECUSADA:
    case TipoNotificacao.CANDIDATURA_ENCERRADA:
    case TipoNotificacao.ANUNCIO_CANCELADO:
      // Aba "Aplicações" do Prestador, onde a candidatura aparece encerrada.
      return { rota: "/(app)/(prestador)/aplicacoes", papel: PapelUsuario.PRESTADOR, conferir: null };
    case TipoNotificacao.AVALIACAO_RECEBIDA:
      return usuarioId
        ? {
            rota: { pathname: "/(app)/perfil/[usuarioId]", params: { usuarioId } },
            papel: null,
            conferir: null,
          }
        : null;
    default:
      break;
  }

  if (!anuncioId) {
    return null;
  }

  switch (tipo) {
    // "Novo candidato" → tela 18 "Candidatos" (US35).
    case TipoNotificacao.NOVA_CANDIDATURA:
      return {
        rota: { pathname: "/(app)/anuncio/[id]/candidatos", params: { id: anuncioId } },
        papel: PapelUsuario.EMPREGADOR,
        conferir: `/anuncios/${anuncioId}`,
      };
    // "Novo serviço na sua área" → tela 30 "Detalhe do anúncio" (US19).
    case TipoNotificacao.NOVO_SERVICO_NA_AREA:
      return {
        rota: { pathname: "/(app)/mural/[id]", params: { id: anuncioId } },
        papel: PapelUsuario.PRESTADOR,
        conferir: `/anuncios/mural/${anuncioId}`,
      };
    // "Check-out enviado" → tela 27 "Validar serviço" (US42). A tela 27 ainda
    // não existe no app: abre o serviço (telas 36/37), de onde ela vai sair.
    case TipoNotificacao.CHECKOUT_ENVIADO:
      return {
        rota: { pathname: "/(app)/servico/[id]", params: { id: anuncioId } },
        papel: PapelUsuario.EMPREGADOR,
        conferir: `/anuncios/${anuncioId}/servico`,
      };
    case TipoNotificacao.PRESTADOR_ESCOLHIDO:
      return {
        rota: { pathname: "/(app)/servico/[id]", params: { id: anuncioId } },
        papel: PapelUsuario.PRESTADOR,
        conferir: `/anuncios/${anuncioId}/servico`,
      };
    case TipoNotificacao.SERVICO_INICIADO:
      return {
        rota: { pathname: "/(app)/servico/[id]", params: { id: anuncioId } },
        papel: PapelUsuario.EMPREGADOR,
        conferir: `/anuncios/${anuncioId}/servico`,
      };
    // "Serviço concluído" → tela 45 "Avaliação" (US53); vale pros dois lados.
    case TipoNotificacao.SERVICO_CONCLUIDO:
      return {
        rota: { pathname: "/(app)/avaliacao/[anuncioId]", params: { anuncioId } },
        papel: null,
        conferir: `/anuncios/${anuncioId}/servico`,
      };
    // Aviso genérico de anúncio: abre o anúncio do jeito que o papel ativo vê.
    case TipoNotificacao.AVISO_DE_ANUNCIO:
      return papelAtivo === PapelUsuario.EMPREGADOR
        ? {
            rota: { pathname: "/(app)/anuncio/[id]", params: { id: anuncioId } },
            papel: PapelUsuario.EMPREGADOR,
            conferir: `/anuncios/${anuncioId}`,
          }
        : {
            rota: { pathname: "/(app)/mural/[id]", params: { id: anuncioId } },
            papel: PapelUsuario.PRESTADOR,
            conferir: `/anuncios/mural/${anuncioId}`,
          };
    default:
      return null;
  }
}
