import { Calendar, Clock, FileText } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { AbaCandidatura } from "../tipos/anuncio.enums";
import type {
  AbaExibida,
  AplicacoesViewModel,
  VazioAplicacoes,
} from "../viewmodel/useAplicacoesViewModel";
import { CartaoCandidatura } from "./componentes/CartaoCandidatura";
import { FolhaDesistirCandidatura } from "./componentes/FolhaDesistirCandidatura";

const ICONE_VAZIO = {
  [AbaCandidatura.PENDENTES]: FileText,
  [AbaCandidatura.COMBINADAS]: Calendar,
  [AbaCandidatura.HISTORICO]: Clock,
};

function SeletorAbas({
  abas,
  aoEscolher,
}: {
  abas: AbaExibida[];
  aoEscolher: (aba: AbaCandidatura) => void;
}) {
  return (
    <View className="flex-row rounded-campo bg-marca-50 p-1" accessibilityRole="tablist">
      {abas.map((aba) => (
        <Pressable
          key={aba.valor}
          onPress={() => aoEscolher(aba.valor)}
          accessibilityRole="tab"
          accessibilityState={{ selected: aba.selecionada }}
          className={`h-9 flex-1 items-center justify-center rounded-chip ${
            aba.selecionada ? "bg-superficie" : "active:opacity-70"
          }`}
        >
          <Text
            className={`text-rotulo ${
              aba.selecionada ? "font-bold text-tinta" : "font-medium text-tinta-suave"
            }`}
          >
            {aba.rotulo}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Telas 32e, 32f e 32g: aba sem candidaturas. */
function Vazio({
  vazio,
  aba,
  aoIrParaMural,
}: {
  vazio: VazioAplicacoes;
  aba: AbaCandidatura;
  aoIrParaMural: () => void;
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
      {vazio.irParaMural ? (
        <Botao
          rotulo="Ir para o Mural"
          variante="contorno"
          tamanho="padrao"
          onPress={aoIrParaMural}
        />
      ) : null}
    </View>
  );
}

/** Tela 32 "Aplicações" do Prestador, com as três abas e a folha 32d. */
export function AplicacoesView({
  abas,
  candidaturas,
  carregando,
  erro,
  vazio,
  carregandoMais,
  atualizando,
  folha,
  aoEscolherAba,
  aoAtualizar,
  aoFimDaLista,
  aoIrParaMural,
  aoCancelar,
  aoVerDetalhes,
  aoConfirmarDesistencia,
  aoFecharFolha,
}: AplicacoesViewModel) {
  const abaAtual = abas.find((aba) => aba.selecionada)?.valor ?? AbaCandidatura.PENDENTES;

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
    conteudo = <Vazio vazio={vazio} aba={abaAtual} aoIrParaMural={aoIrParaMural} />;
  } else {
    conteudo = (
      <FlatList
        data={candidaturas}
        keyExtractor={(candidatura) => candidatura.id}
        renderItem={({ item }) => (
          <CartaoCandidatura
            candidatura={item}
            aoCancelar={() => aoCancelar(item.id)}
            aoVerDetalhes={() => aoVerDetalhes(item.anuncioId)}
          />
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
      <View className="gap-4 px-margem pb-4 pt-4">
        <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
          Aplicações
        </Text>
        <SeletorAbas abas={abas} aoEscolher={aoEscolherAba} />
      </View>

      {conteudo}

      <FolhaDesistirCandidatura
        folha={folha}
        aoConfirmar={aoConfirmarDesistencia}
        aoFechar={aoFecharFolha}
      />
    </SafeAreaView>
  );
}
