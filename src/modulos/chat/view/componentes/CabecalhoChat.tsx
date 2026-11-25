import { ChevronLeft, Flag, MoreVertical, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "../../../../comum/componentes/ui/Avatar";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import { MenuSuspenso } from "../../../../comum/componentes/ui/MenuSuspenso";
import type { CabecalhoChatExibido } from "../../viewmodel/useChatViewModel";

interface CabecalhoChatProps {
  cabecalho: CabecalhoChatExibido | null;
  aoVoltar: () => void;
  menuAberto: boolean;
  aoAbrirMenu: () => void;
  aoFecharMenu: () => void;
  aoVerPerfil: () => void;
  aoDenunciar: () => void;
}

/** Topo das telas 21 e 22: outra parte, e o menu "⋮" (21b) ou o selo "Somente leitura". */
export function CabecalhoChat({
  cabecalho,
  aoVoltar,
  menuAberto,
  aoAbrirMenu,
  aoFecharMenu,
  aoVerPerfil,
  aoDenunciar,
}: CabecalhoChatProps) {
  return (
    <View className="flex-row items-center gap-3 border-b border-borda bg-superficie py-3 pl-3 pr-margem">
      <Pressable
        onPress={aoVoltar}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="h-toque w-8 items-center justify-center"
      >
        <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
      </Pressable>

      {cabecalho ? (
        <>
          <Avatar nome={cabecalho.nome} fotoUrl={cabecalho.fotoUrl} tamanho={40} />
          <View className="flex-1">
            <Text className="text-[17px] font-bold text-tinta" numberOfLines={1} accessibilityRole="header">
              {cabecalho.nome}
            </Text>
            <Text className="text-rotulo text-tinta-fraco" numberOfLines={1}>
              {cabecalho.subtitulo}
            </Text>
          </View>
          {cabecalho.somenteLeitura ? (
            <View className="rounded-full bg-borda px-2.5 py-1.5">
              <Text className="text-overline font-bold uppercase text-tinta-suave">
                Somente leitura
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={aoAbrirMenu}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Mais opções"
              className="h-toque w-8 items-center justify-center"
            >
              <Icone icone={MoreVertical} tamanho={20} cor="suave" />
            </Pressable>
          )}
        </>
      ) : (
        <View className="flex-1" />
      )}

      {/* Tela 21b. */}
      <MenuSuspenso
        aberto={menuAberto}
        aoFechar={aoFecharMenu}
        itens={[
          { icone: User, rotulo: "Ver perfil", aoPressionar: aoVerPerfil },
          { icone: Flag, rotulo: "Denunciar", aoPressionar: aoDenunciar },
        ]}
      />
    </View>
  );
}
