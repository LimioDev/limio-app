import { Pressable, Text, View } from "react-native";

import { Avatar } from "../../../../comum/componentes/ui/Avatar";
import { Badge } from "../../../../comum/componentes/ui/Badge";
import type { Estado } from "../../../../comum/tipos/api";
import { SeloConversa } from "../../tipos/chat.enums";
import type { ConversaExibida } from "../../viewmodel/useConversasViewModel";

// Cores do protótipo: Escolhido/Combinado em azul cheio, Candidato(a)/Pendente
// em azul claro e Encerrada em cinza (os pares de "andamento", "aguardando" e
// "expirado" do Badge).
const ESTADO_DO_SELO: Record<SeloConversa, Estado> = {
  [SeloConversa.ESCOLHIDO]: "andamento",
  [SeloConversa.COMBINADO]: "andamento",
  [SeloConversa.CANDIDATO]: "aguardando",
  [SeloConversa.PENDENTE]: "aguardando",
  [SeloConversa.ENCERRADA]: "expirado",
};

interface CartaoConversaListaProps {
  conversa: ConversaExibida;
  onPress: () => void;
}

/**
 * Item das telas 42/42b: foto ou iniciais, nome, hora, última mensagem, selo,
 * título do anúncio e a bolinha com as não lidas. Encerrada fica mais clara.
 */
export function CartaoConversaLista({ conversa, onPress }: CartaoConversaListaProps) {
  const comNaoLidas = conversa.naoLidas > 0;
  const corNome = conversa.encerrada ? "text-tinta-fraco" : "text-tinta";
  const corMensagem = conversa.encerrada ? "text-tinta-fraco" : "text-tinta-suave";

  const rotuloAcessivel = [
    conversa.nome,
    conversa.rotuloSelo,
    conversa.tituloAnuncio,
    conversa.ultimaMensagem ?? "Nenhuma mensagem ainda",
    conversa.hora,
    comNaoLidas
      ? `${conversa.naoLidas} ${conversa.naoLidas === 1 ? "mensagem não lida" : "mensagens não lidas"}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      className={`flex-row items-center gap-3 rounded-card border bg-superficie p-4 active:opacity-70 ${
        comNaoLidas ? "border-marca-100" : "border-borda"
      }`}
    >
      <Avatar nome={conversa.nome} fotoUrl={conversa.fotoUrl} cacheKey={conversa.fotoCacheKey} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className={`flex-1 text-corpo font-bold ${corNome}`} numberOfLines={1}>
            {conversa.nome}
          </Text>
          {conversa.hora ? (
            <Text className="text-rotulo text-tinta-fraco">{conversa.hora}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Text
            className={`flex-1 text-[14px] ${corMensagem} ${conversa.ultimaMensagem ? "" : "italic"}`}
            numberOfLines={1}
          >
            {conversa.ultimaMensagem ?? "Nenhuma mensagem ainda"}
          </Text>
          {comNaoLidas ? (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-marca-500 px-1.5">
              <Text className="text-micro font-bold text-white">
                {conversa.naoLidas > 99 ? "99+" : conversa.naoLidas}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Badge estado={ESTADO_DO_SELO[conversa.selo]} rotulo={conversa.rotuloSelo} />
          <Text className="flex-1 text-rotulo text-tinta-fraco" numberOfLines={1}>
            {conversa.tituloAnuncio}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
