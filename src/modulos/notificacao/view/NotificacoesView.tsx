import { BellOff } from "lucide-react-native";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  NotificacaoExibida,
  SecaoNotificacoes,
} from "../viewmodel/useNotificacoesViewModel";
import { CartaoNotificacao } from "./componentes/CartaoNotificacao";

interface NotificacoesViewProps {
  secoes: SecaoNotificacoes[] | null;
  carregando: boolean;
  erro: string | null;
  aoTentarDeNovo: () => void;
  atualizando: boolean;
  aoAtualizar: () => void;
  carregandoMais: boolean;
  aoFimDaLista: () => void;
  podeMarcarTodas: boolean;
  aoMarcarTodas: () => void;
  abrindoId: string | null;
  aoTocar: (id: string) => void;
  aoVoltar: () => void;
}

// Linhas da lista: o dia vira uma linha própria antes dos itens dele. `FlatList`
// (e não `SectionList`), como as outras listas do app.
type Linha =
  | { tipo: "dia"; chave: string; titulo: string }
  | { tipo: "item"; chave: string; notificacao: NotificacaoExibida };

function emLinhas(secoes: SecaoNotificacoes[]): Linha[] {
  return secoes.flatMap((secao): Linha[] => [
    { tipo: "dia", chave: `dia-${secao.chave}`, titulo: secao.titulo },
    ...secao.data.map((n): Linha => ({ tipo: "item", chave: n.id, notificacao: n })),
  ]);
}

function SemNotificacoes() {
  return (
    <View className="items-center gap-3 px-margem pt-24">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={BellOff} tamanho={24} cor="marca" />
      </View>
      <Text className="text-center text-secao font-bold text-tinta">
        Nenhuma notificação por aqui
      </Text>
      <Text className="text-center text-corpo text-tinta-suave">
        Avisos de candidatos, serviços e cobranças aparecem aqui.
      </Text>
    </View>
  );
}

/** Tela 43 "Notificações". */
export function NotificacoesView({
  secoes,
  carregando,
  erro,
  aoTentarDeNovo,
  atualizando,
  aoAtualizar,
  carregandoMais,
  aoFimDaLista,
  podeMarcarTodas,
  aoMarcarTodas,
  abrindoId,
  aoTocar,
  aoVoltar,
}: NotificacoesViewProps) {
  const marcarLidas = (
    <Text
      onPress={podeMarcarTodas ? aoMarcarTodas : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: !podeMarcarTodas }}
      className={`text-rotulo font-semibold ${
        podeMarcarTodas ? "text-marca-500" : "text-tinta-fraco"
      }`}
    >
      Marcar lidas
    </Text>
  );

  let conteudo;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (!secoes) {
    conteudo = (
      <View className="flex-1 items-center justify-center gap-4 px-margem">
        <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
        <Botao
          rotulo="Tentar de novo"
          variante="contorno"
          tamanho="padrao"
          carregando={atualizando}
          onPress={aoTentarDeNovo}
        />
      </View>
    );
  } else {
    conteudo = (
      <FlatList
        data={emLinhas(secoes)}
        keyExtractor={(linha) => linha.chave}
        contentContainerClassName="gap-3 px-margem pb-8 pt-4"
        renderItem={({ item: linha }) =>
          linha.tipo === "dia" ? (
            <Text className="pt-2 text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
              {linha.titulo}
            </Text>
          ) : (
            <CartaoNotificacao
              notificacao={linha.notificacao}
              abrindo={abrindoId === linha.notificacao.id}
              onPress={() => aoTocar(linha.notificacao.id)}
            />
          )
        }
        ListEmptyComponent={SemNotificacoes}
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
        titulo="Notificações"
        aoVoltar={aoVoltar}
        direita={secoes && secoes.length > 0 ? marcarLidas : undefined}
      />
      {conteudo}
    </SafeAreaView>
  );
}
