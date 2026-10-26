import { Bell, LayoutGrid, Plus, User, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SeletorPapelAtivo } from "../../../comum/componentes/sessao/SeletorPapelAtivo";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Vazio } from "../../../comum/componentes/ui/Vazio";
import type { PainelExibido } from "../viewmodel/usePainelEmpregadorViewModel";
import { CartaoAnuncio } from "./componentes/CartaoAnuncio";

interface PainelEmpregadorViewProps {
  /** Foto, data e saudação: vem pronto da rota, pra `anuncio` não importar `perfil`. */
  cabecalho: ReactNode;
  painel: PainelExibido | null;
  carregando: boolean;
  erro: string | null;
  atualizando: boolean;
  aoAtualizar: () => void;
  aoAbrirNotificacoes: () => void;
  aoPublicar: () => void;
  aoVerHistorico: () => void;
  aoAbrirAnuncio: (id: string) => void;
}

function Contador({
  valor,
  rotulo,
  icone,
}: {
  valor: number;
  rotulo: string;
  icone: LucideIcon;
}) {
  return (
    <View className="flex-1 gap-1 rounded-card border border-borda bg-superficie p-4">
      <View className="flex-row items-start justify-between">
        <Text className="text-titulo font-bold text-tinta">{valor}</Text>
        <Icone icone={icone} tamanho={18} cor="marca" />
      </View>
      <Text className="text-rotulo text-tinta-suave">{rotulo}</Text>
    </View>
  );
}

export function PainelEmpregadorView({
  cabecalho,
  painel,
  carregando,
  erro,
  atualizando,
  aoAtualizar,
  aoAbrirNotificacoes,
  aoPublicar,
  aoVerHistorico,
  aoAbrirAnuncio,
}: PainelEmpregadorViewProps) {
  if (carregando) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
        <Carregando />
      </SafeAreaView>
    );
  }

  if (!painel) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            carregando={atualizando}
            onPress={aoAtualizar}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-margem pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            tintColor="#2159CC"
            colors={["#2159CC"]}
          />
        }
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-3">
            {cabecalho}
            <SeletorPapelAtivo />
          </View>
          <Pressable
            onPress={aoAbrirNotificacoes}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            className="h-toque w-toque items-center justify-center rounded-campo border border-borda bg-superficie active:opacity-70"
          >
            <Icone icone={Bell} tamanho={20} cor="tinta" />
          </Pressable>
        </View>

        <Pressable
          onPress={aoPublicar}
          accessibilityRole="button"
          className="flex-row items-center gap-3 overflow-hidden rounded-destaque bg-marca-500 p-5 active:opacity-90"
        >
          {/* Anéis decorativos do protótipo. */}
          <View className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/15" />
          <View className="absolute -right-4 -top-8 h-32 w-32 rounded-full border border-white/15" />
          <View className="flex-1 gap-1">
            <Text className="text-[18px] font-bold text-white">Publicar um serviço</Text>
            <Text className="text-rotulo text-marca-50">
              Descreva a demanda em menos de 1 minuto.
            </Text>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Icone icone={Plus} tamanho={22} cor="branco" />
          </View>
        </Pressable>

        <View className="flex-row gap-3">
          <Contador
            valor={painel.anunciosAbertos}
            rotulo="anúncios abertos"
            icone={LayoutGrid}
          />
          <Contador
            valor={painel.novosCandidatos}
            rotulo="novos candidatos"
            icone={User}
          />
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
              Seus anúncios
            </Text>
            <Text
              onPress={aoVerHistorico}
              accessibilityRole="link"
              className="text-rotulo font-semibold text-marca-500"
            >
              Ver histórico
            </Text>
          </View>

          {painel.anuncios.length === 0 ? (
            <View className="rounded-card border border-borda bg-superficie py-6">
              <Vazio mensagem="Você ainda não tem anúncios. Publique um serviço para receber candidatos." />
            </View>
          ) : (
            painel.anuncios.map((anuncio) => (
              <CartaoAnuncio
                key={anuncio.id}
                anuncio={anuncio}
                onPress={() => aoAbrirAnuncio(anuncio.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
