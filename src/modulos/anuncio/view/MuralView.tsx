import { Search, SlidersHorizontal, X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SeletorPapelAtivo } from "../../../comum/componentes/sessao/SeletorPapelAtivo";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Chip } from "../../../comum/componentes/ui/Chip";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Vazio } from "../../../comum/componentes/ui/Vazio";
import type { MuralViewModel } from "../viewmodel/useMuralViewModel";
import { CartaoAnuncioMural } from "./componentes/CartaoAnuncioMural";
import { FolhaFiltrosMural } from "./componentes/FolhaFiltrosMural";

type MuralViewProps = MuralViewModel & {
  /** Faixa "Plano FREE — N de 4 escolhas usadas" (ETI-79/ETI-80), composta pela rota. */
  faixaCota?: ReactNode;
};

function BotaoTopo({
  icone,
  rotulo,
  onPress,
}: {
  icone: typeof Search;
  rotulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      className="h-toque w-toque items-center justify-center rounded-campo border border-borda bg-superficie active:opacity-70"
    >
      <Icone icone={icone} tamanho={20} cor="tinta" />
    </Pressable>
  );
}

/** Tela 29: nenhum anúncio compatível dentro do raio. */
function MuralVazio({ aoAumentarRaio }: { aoAumentarRaio: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-8 px-margem pb-6">
      <View className="h-[184px] w-[184px] items-center justify-center rounded-full border border-marca-100">
        <View className="h-[116px] w-[116px] items-center justify-center rounded-full border border-marca-100">
          <View className="h-[64px] w-[64px] items-center justify-center rounded-full border border-marca-100">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-marca-50">
              <Icone icone={Search} tamanho={20} cor="marca" />
            </View>
          </View>
        </View>
      </View>
      <View className="gap-1">
        <Text className="text-center text-secao font-bold text-tinta">
          Nenhum serviço na sua área
        </Text>
        <Text className="text-center text-corpo text-tinta-suave">
          Não encontramos nenhum anúncio dentro do seu raio por enquanto.
        </Text>
      </View>
      <View className="w-full px-6">
        <Botao rotulo="Aumentar raio de busca" onPress={aoAumentarRaio} />
      </View>
      <Text className="text-center text-rotulo text-tinta-fraco">
        Avisaremos você quando novas oportunidades aparecerem.
      </Text>
    </View>
  );
}

function Aviso({
  mensagem,
  rotuloAcao,
  aoAcao,
  carregando = false,
}: {
  mensagem: string;
  rotuloAcao: string;
  aoAcao: () => void;
  carregando?: boolean;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-margem">
      <Text className="text-center text-corpo text-tinta-suave">{mensagem}</Text>
      <Botao
        rotulo={rotuloAcao}
        variante="contorno"
        tamanho="padrao"
        carregando={carregando}
        onPress={aoAcao}
      />
    </View>
  );
}

export function MuralView({
  faixaCota,
  subtitulo,
  atalhos,
  anuncios,
  carregando,
  bloqueio,
  erro,
  vazio,
  buscaSemResultado,
  carregandoMais,
  atualizando,
  buscaAberta,
  busca,
  folha,
  aoAtualizar,
  aoFimDaLista,
  aoEscolherAtalho,
  aoAbrirAnuncio,
  aoAlternarBusca,
  aoBuscar,
  aoAumentarRaio,
  aoAbrirFiltros,
  aoFecharFiltros,
  aoLimparFiltros,
  aoAplicarFiltros,
  aoExpandirCategorias,
  aoAlternarCategoria,
  aoMudarRaio,
  aoEscolherQuando,
}: MuralViewProps) {
  let conteudo: ReactNode;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (bloqueio) {
    conteudo = (
      <Aviso mensagem={bloqueio.mensagem} rotuloAcao={bloqueio.rotuloAcao} aoAcao={bloqueio.aoAcao} />
    );
  } else if (erro) {
    conteudo = (
      <Aviso
        mensagem={erro}
        rotuloAcao="Tentar de novo"
        aoAcao={aoAtualizar}
        carregando={atualizando}
      />
    );
  } else if (vazio) {
    conteudo = <MuralVazio aoAumentarRaio={aoAumentarRaio} />;
  } else {
    conteudo = (
      <FlatList
        data={anuncios}
        keyExtractor={(anuncio) => anuncio.id}
        renderItem={({ item }) => (
          <CartaoAnuncioMural anuncio={item} onPress={() => aoAbrirAnuncio(item.id)} />
        )}
        contentContainerClassName="gap-3 px-margem pb-8 pt-1"
        ListHeaderComponent={faixaCota ? <View className="pb-1">{faixaCota}</View> : null}
        ListEmptyComponent={
          buscaSemResultado ? <Vazio mensagem="Nenhum serviço com esse título." /> : null
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
          <Text className="text-[32px] font-bold tracking-[-0.6px] text-tinta" accessibilityRole="header">
            Mural
          </Text>
          <View className="flex-1">
            <SeletorPapelAtivo />
          </View>
          {vazio ? null : (
            <BotaoTopo
              icone={buscaAberta ? X : Search}
              rotulo={buscaAberta ? "Fechar busca" : "Buscar no mural"}
              onPress={aoAlternarBusca}
            />
          )}
          <BotaoTopo icone={SlidersHorizontal} rotulo="Filtros" onPress={aoAbrirFiltros} />
        </View>
        <Text className="-mt-2 text-rotulo text-tinta-suave">{subtitulo}</Text>
        {buscaAberta ? (
          <View className="h-11 flex-row items-center gap-2.5 rounded-campo border border-borda-campo bg-superficie px-4">
            <Icone icone={Search} tamanho={16} cor="fraco" />
            <TextInput
              value={busca}
              onChangeText={aoBuscar}
              placeholder="Buscar pelo título"
              placeholderTextColor="#7B87A4"
              selectionColor="#2159CC"
              className="h-full flex-1 text-corpo text-tinta"
              autoFocus
              autoCorrect={false}
              accessibilityLabel="Buscar pelo título"
            />
          </View>
        ) : null}
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-margem pb-3"
        >
          {atalhos.map((atalho) => (
            <Chip
              key={atalho.id ?? "todas"}
              rotulo={atalho.nome}
              selecionado={atalho.selecionado}
              onPress={() => aoEscolherAtalho(atalho.id)}
            />
          ))}
        </ScrollView>
      </View>

      {conteudo}

      <FolhaFiltrosMural
        folha={folha}
        aoFechar={aoFecharFiltros}
        aoLimpar={aoLimparFiltros}
        aoAplicar={aoAplicarFiltros}
        aoExpandirCategorias={aoExpandirCategorias}
        aoAlternarCategoria={aoAlternarCategoria}
        aoMudarRaio={aoMudarRaio}
        aoEscolherQuando={aoEscolherQuando}
      />
    </SafeAreaView>
  );
}
