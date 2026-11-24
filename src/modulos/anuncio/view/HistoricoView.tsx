import { Calendar, CircleCheck, CircleX, Clock, Funnel } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Chip } from "../../../comum/componentes/ui/Chip";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { StatusHistorico } from "../tipos/anuncio.enums";
import type { HistoricoViewModel, VazioHistorico } from "../viewmodel/useHistoricoViewModel";
import { CartaoHistorico } from "./componentes/CartaoHistorico";
import { FolhaPeriodoHistorico } from "./componentes/FolhaPeriodoHistorico";

const ICONE_VAZIO = {
  [StatusHistorico.CONCLUIDO]: CircleCheck,
  [StatusHistorico.CANCELADO]: CircleX,
  [StatusHistorico.EXPIRADO]: Clock,
};

/** Aba sem itens no período. */
function Vazio({
  vazio,
  aba,
  aoTrocarPeriodo,
}: {
  vazio: VazioHistorico;
  aba: StatusHistorico;
  aoTrocarPeriodo: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-5 px-margem pb-10">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-marca-50">
        <Icone icone={ICONE_VAZIO[aba]} tamanho={24} cor="marca" />
      </View>
      <View className="gap-1.5">
        <Text className="text-center text-secao font-bold text-tinta">{vazio.titulo}</Text>
        <Text className="text-center text-corpo text-tinta-suave">{vazio.texto}</Text>
      </View>
      <Botao
        rotulo="Trocar período"
        variante="contorno"
        tamanho="padrao"
        onPress={aoTrocarPeriodo}
      />
    </View>
  );
}

/** Tela 44 "Histórico" do Empregador, na aba Anúncios. */
export function HistoricoView({
  abas,
  itens,
  periodo,
  resumo,
  rotuloPeriodo,
  carregando,
  erro,
  vazio,
  carregandoMais,
  atualizando,
  folha,
  aoVoltar,
  aoEscolherAba,
  aoAtualizar,
  aoFimDaLista,
  aoAvaliar,
  aoTrocarPeriodo,
  aoEscolherPeriodo,
  aoMudarDataInicio,
  aoMudarDataFim,
  aoAplicarPeriodo,
  aoFecharFolha,
}: HistoricoViewModel) {
  const abaAtual = abas.find((aba) => aba.selecionada)?.valor ?? StatusHistorico.CONCLUIDO;

  let conteudo: ReactNode;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (erro) {
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
  } else if (vazio) {
    conteudo = <Vazio vazio={vazio} aba={abaAtual} aoTrocarPeriodo={aoTrocarPeriodo} />;
  } else {
    conteudo = (
      <FlatList
        data={itens}
        keyExtractor={(item) => item.anuncioId}
        renderItem={({ item }) => (
          <CartaoHistorico item={item} aoAvaliar={() => aoAvaliar(item.anuncioId)} />
        )}
        contentContainerClassName="gap-3 px-margem pb-8 pt-1"
        ListFooterComponent={
          carregandoMais ? (
            <View className="py-4">
              <ActivityIndicator color="#2159CC" />
            </View>
          ) : null
        }
        onEndReached={aoFimDaLista}
        onEndReachedThreshold={0.5}
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
      <CabecalhoVoltar
        titulo="Histórico"
        aoVoltar={aoVoltar}
        direita={
          <Pressable
            onPress={aoTrocarPeriodo}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Filtrar por período"
            className="h-toque w-8 items-center justify-center active:opacity-70"
          >
            <Icone icone={Funnel} tamanho={22} cor="tinta" />
          </Pressable>
        }
      />

      <View className="gap-4 px-margem pb-3 pt-4">
        <View className="flex-row gap-2" accessibilityRole="tablist">
          {abas.map((aba) => (
            <Chip
              key={aba.valor}
              rotulo={aba.rotulo}
              selecionado={aba.selecionada}
              onPress={() => aoEscolherAba(aba.valor)}
            />
          ))}
        </View>

        <View className="flex-row items-center gap-3 rounded-campo border border-borda bg-superficie px-4 py-3.5">
          <Icone icone={Calendar} tamanho={16} cor="suave" />
          <Text className="flex-1 text-corpo text-tinta" numberOfLines={1}>
            {periodo}
          </Text>
          <Text
            onPress={aoTrocarPeriodo}
            accessibilityRole="button"
            accessibilityLabel="Trocar período"
            className="text-corpo font-bold text-marca-500"
          >
            Trocar
          </Text>
        </View>

        {resumo ? (
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-rotulo font-bold text-tinta-suave" numberOfLines={1}>
              {resumo}
            </Text>
            <Text className="text-rotulo text-tinta-fraco">{rotuloPeriodo}</Text>
          </View>
        ) : null}
      </View>

      {conteudo}

      <FolhaPeriodoHistorico
        folha={folha}
        aoEscolher={aoEscolherPeriodo}
        aoMudarDataInicio={aoMudarDataInicio}
        aoMudarDataFim={aoMudarDataFim}
        aoAplicar={aoAplicarPeriodo}
        aoFechar={aoFecharFolha}
      />
    </SafeAreaView>
  );
}
