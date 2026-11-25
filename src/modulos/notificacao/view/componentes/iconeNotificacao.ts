import {
  Ban,
  Bell,
  Camera,
  CircleCheck,
  CircleX,
  Handshake,
  Megaphone,
  Play,
  Star,
  User,
  type LucideIcon,
} from "lucide-react-native";

import { TipoNotificacao } from "../../tipos/notificacao.enums";

// `Record` exaustivo: tipo novo no enum sem ícone = erro de compilação.
const ICONES: Record<TipoNotificacao, LucideIcon> = {
  [TipoNotificacao.NOVO_SERVICO_NA_AREA]: Bell,
  [TipoNotificacao.NOVA_CANDIDATURA]: User,
  [TipoNotificacao.PRESTADOR_ESCOLHIDO]: Handshake,
  [TipoNotificacao.CANDIDATURA_RECUSADA]: CircleX,
  [TipoNotificacao.CANDIDATURA_ENCERRADA]: Ban,
  [TipoNotificacao.ANUNCIO_CANCELADO]: Ban,
  [TipoNotificacao.SERVICO_INICIADO]: Play,
  [TipoNotificacao.CHECKOUT_ENVIADO]: Camera,
  [TipoNotificacao.SERVICO_CONCLUIDO]: CircleCheck,
  [TipoNotificacao.AVALIACAO_RECEBIDA]: Star,
  [TipoNotificacao.AVISO_DE_ANUNCIO]: Megaphone,
};

/** Ícone do tipo na tela 43 e no banner do push; tipo desconhecido = sino. */
export function iconeNotificacao(tipo: TipoNotificacao | null): LucideIcon {
  return tipo ? ICONES[tipo] : Bell;
}
