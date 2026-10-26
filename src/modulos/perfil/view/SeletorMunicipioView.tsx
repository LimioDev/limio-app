import { Check, Search } from "lucide-react-native";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Chip } from "../../../comum/componentes/ui/Chip";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { Uf } from "../tipos/perfil.enums";
import { CabecalhoVoltar } from "./componentes/CabecalhoVoltar";

interface MunicipioItem {
  id: number;
  nome: string;
  selecionado: boolean;
}

interface SeletorMunicipioViewProps {
  titulo: string;
  ufs: readonly Uf[];
  uf: Uf | null;
  aoEscolherUf: (uf: Uf) => void;
  busca: string;
  aoBuscar: (texto: string) => void;
  carregando: boolean;
  erro: string | null;
  aoTentarDeNovo: () => void;
  municipios: MunicipioItem[];
  semResultado: boolean;
  aoEscolher: (nome: string) => void;
  aoVoltar: () => void;
}

export function SeletorMunicipioView({
  titulo,
  ufs,
  uf,
  aoEscolherUf,
  busca,
  aoBuscar,
  carregando,
  erro,
  aoTentarDeNovo,
  municipios,
  semResultado,
  aoEscolher,
  aoVoltar,
}: SeletorMunicipioViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo={titulo} aoVoltar={aoVoltar} />

      <View className="gap-3 pt-4">
        <Text className="px-margem text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
          Estado
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-margem"
        >
          {ufs.map((sigla) => (
            <Chip
              key={sigla}
              rotulo={sigla}
              selecionado={sigla === uf}
              onPress={() => aoEscolherUf(sigla)}
            />
          ))}
        </ScrollView>

        {uf ? (
          <View className="mx-margem h-botao flex-row items-center gap-2.5 rounded-campo border border-borda bg-superficie px-4">
            <Icone icone={Search} tamanho={18} cor="fraco" />
            <TextInput
              value={busca}
              onChangeText={aoBuscar}
              placeholder="Buscar município"
              placeholderTextColor="#7B87A4"
              selectionColor="#2159CC"
              className="h-full flex-1 text-corpo text-tinta"
              autoCorrect={false}
              accessibilityLabel="Buscar município"
            />
          </View>
        ) : null}
      </View>

      {!uf ? (
        <View className="flex-1 items-center justify-center px-margem">
          <Text className="text-center text-corpo text-tinta-suave">
            Escolha o estado para ver os municípios.
          </Text>
        </View>
      ) : carregando ? (
        <Carregando />
      ) : erro ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoTentarDeNovo}
          />
        </View>
      ) : (
        <FlatList
          data={municipios}
          keyExtractor={(m) => String(m.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-margem pb-6 pt-3"
          ListEmptyComponent={
            semResultado ? (
              <Text className="py-6 text-center text-corpo text-tinta-suave">
                Nenhum município encontrado.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => aoEscolher(item.nome)}
              accessibilityRole="button"
              accessibilityState={{ selected: item.selecionado }}
              className="h-12 flex-row items-center justify-between border-b border-borda active:opacity-70"
            >
              <Text
                className={`text-corpo ${item.selecionado ? "font-bold text-marca-500" : "text-tinta"}`}
              >
                {item.nome}
              </Text>
              {item.selecionado ? <Icone icone={Check} tamanho={18} cor="marca" /> : null}
            </Pressable>
          )}
        />
      )}

      <Text className="px-margem pb-2 text-micro text-tinta-fraco">
        Lista de municípios: IBGE
      </Text>
    </SafeAreaView>
  );
}
