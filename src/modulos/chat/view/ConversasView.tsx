import { MessageSquare, Search, X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Vazio } from "../../../comum/componentes/ui/Vazio";
import type { ConversasViewModel } from "../viewmodel/useConversasViewModel";
import { CartaoConversaLista } from "./componentes/CartaoConversaLista";

function SemConversas({ ehEmpregador }: { ehEmpregador: boolean }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-margem pb-12">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={MessageSquare} tamanho={24} cor="marca" />
      </View>
      <Text className="text-center text-secao font-bold text-tinta">Nenhuma conversa ainda</Text>
      <Text className="text-center text-corpo text-tinta-suave">
        {ehEmpregador
          ? "Quando alguém se candidatar aos seus anúncios, a conversa aparece aqui."
          : "Quando você se candidatar a um serviço, a conversa com o Empregador aparece aqui."}
      </Text>
    </View>
  );
}

/** Telas 42 "Conversas" (Empregador) e 42b (Prestador), na aba "Chats". */
export function ConversasView({
  conversas,
  carregando,
  erro,
  subtitulo,
  semConversas,
  ehEmpregador,
  buscaAberta,
  busca,
  buscaSemResultado,
  aoAlternarBusca,
  aoBuscar,
  atualizando,
  aoAtualizar,
  carregandoMais,
  aoFimDaLista,
  aoAbrirConversa,
}: ConversasViewModel) {
  let conteudo: ReactNode;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (!conversas) {
    conteudo = (
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
    );
  } else if (semConversas) {
    conteudo = <SemConversas ehEmpregador={ehEmpregador} />;
  } else {
    conteudo = (
      <FlatList
        data={conversas}
        keyExtractor={(conversa) => conversa.candidaturaId}
        renderItem={({ item }) => (
          <CartaoConversaLista conversa={item} onPress={() => aoAbrirConversa(item.candidaturaId)} />
        )}
        contentContainerClassName="gap-3 px-margem pb-8 pt-1"
        ListEmptyComponent={
          buscaSemResultado ? <Vazio mensagem="Nenhuma conversa com esse nome ou título." /> : null
        }
        ListFooterComponent={
          carregandoMais ? (
            <View className="py-4">
              <ActivityIndicator color="#2159CC" />
            </View>
          ) : null
        }
        onEndReached={aoFimDaLista}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            tintColor="#2159CC"
            colors={["#2159CC"]}
          />
        }
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <View className="gap-3 px-margem pb-3 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text
              className="text-[32px] font-bold tracking-[-0.6px] text-tinta"
              accessibilityRole="header"
            >
              Conversas
            </Text>
            {conversas && !semConversas ? (
              <Text className="text-rotulo text-tinta-suave">{subtitulo}</Text>
            ) : null}
          </View>
          {conversas && !semConversas ? (
            <Pressable
              onPress={aoAlternarBusca}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={buscaAberta ? "Fechar busca" : "Buscar conversa"}
              className="h-toque w-toque items-center justify-center rounded-campo border border-borda bg-superficie active:opacity-70"
            >
              <Icone icone={buscaAberta ? X : Search} tamanho={20} cor="tinta" />
            </Pressable>
          ) : null}
        </View>
        {buscaAberta ? (
          <View className="h-11 flex-row items-center gap-2.5 rounded-campo border border-borda-campo bg-superficie px-4">
            <Icone icone={Search} tamanho={16} cor="fraco" />
            <TextInput
              value={busca}
              onChangeText={aoBuscar}
              placeholder="Buscar por nome ou anúncio"
              placeholderTextColor="#7B87A4"
              selectionColor="#2159CC"
              className="h-full flex-1 text-corpo text-tinta"
              autoFocus
              autoCorrect={false}
              accessibilityLabel="Buscar por nome ou anúncio"
            />
          </View>
        ) : null}
      </View>

      {conteudo}
    </SafeAreaView>
  );
}
