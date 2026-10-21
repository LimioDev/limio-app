import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";

interface AjustesViewProps {
  rotuloPapelAtivo: string | null;
  aoAlternarPapel: () => void;
  aoAlterarSenha: () => void;
  aoSair: () => void;
  saindo: boolean;
  aoVoltar: () => void;
  /** Seção "Notificações", montada pela rota a partir do módulo `conta`. */
  secaoNotificacoes?: ReactNode;
}

export function AjustesView({
  rotuloPapelAtivo,
  aoAlternarPapel,
  aoAlterarSenha,
  aoSair,
  saindo,
  aoVoltar,
  secaoNotificacoes,
}: AjustesViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-row items-center gap-1 px-margem pt-2">
        <Pressable
          onPress={aoVoltar}
          hitSlop={12}
          className="h-toque w-8 items-center justify-center"
        >
          <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
        </Pressable>
        <Text className="text-secao font-semibold text-tinta">Ajustes</Text>
      </View>

      <ScrollView
        className="flex-1 px-margem"
        contentContainerClassName="gap-6 pb-6 pt-5"
      >
        <View className="gap-2">
          <Text className="text-overline font-semibold uppercase text-tinta-fraco">
            Conta
          </Text>
          <Pressable
            onPress={aoAlterarSenha}
            className="flex-row items-center justify-between rounded-card border border-borda bg-superficie p-4"
          >
            <Text className="text-corpo text-tinta">Alterar senha</Text>
            <Icone icone={ChevronRight} />
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="text-overline font-semibold uppercase text-tinta-fraco">
            Papel
          </Text>
          <Pressable
            onPress={aoAlternarPapel}
            className="flex-row items-center justify-between rounded-card border border-borda bg-superficie p-4"
          >
            <View className="gap-1">
              <Text className="text-corpo font-semibold text-tinta">
                Alternar papel
              </Text>
              {rotuloPapelAtivo ? (
                <Text className="text-rotulo text-tinta-suave">
                  Agora: {rotuloPapelAtivo}
                </Text>
              ) : null}
            </View>
            <Icone icone={ChevronRight} />
          </Pressable>
        </View>

        {secaoNotificacoes}
      </ScrollView>

      {/* Visual provisório: o botão "Sair" ainda não foi desenhado (pendência de design do ETI-38). */}
      <View className="border-t border-borda px-margem py-4">
        <Botao
          rotulo={saindo ? "Saindo..." : "Sair"}
          variante="destrutivo"
          onPress={aoSair}
          disabled={saindo}
        />
      </View>
    </SafeAreaView>
  );
}
