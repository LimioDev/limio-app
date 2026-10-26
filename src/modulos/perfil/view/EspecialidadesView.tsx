import { Check, Search, Wrench } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  GrupoEspecialidades,
  ItemEspecialidade,
} from "../viewmodel/useEspecialidadesViewModel";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";

interface EspecialidadesViewProps {
  carregando: boolean;
  erroCarregamento: string | null;
  aoTentarDeNovo: () => void;
  busca: string;
  aoBuscar: (texto: string) => void;
  contador: string;
  grupos: GrupoEspecialidades[];
  semResultado: boolean;
  aoAlternar: (id: string) => void;
  rotuloSalvar: string;
  podeSalvar: boolean;
  aoSalvar: () => void;
  aoVoltar: () => void;
}

function LinhaEspecialidade({
  item,
  aoAlternar,
}: {
  item: ItemEspecialidade;
  aoAlternar: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => aoAlternar(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.selecionada }}
      accessibilityLabel={item.nome}
      className={`h-14 flex-row items-center gap-3 rounded-campo px-3 active:opacity-80 ${item.selecionada ? "border-[1.5px] border-marca-500 bg-marca-50" : "border border-borda bg-superficie"}`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-chip ${item.selecionada ? "bg-marca-500" : "bg-marca-50"}`}
      >
        <Icone icone={Wrench} tamanho={16} cor={item.selecionada ? "branco" : "marca"} />
      </View>
      <Text
        className={`flex-1 text-corpo ${item.selecionada ? "font-bold text-marca-500" : "text-tinta"}`}
      >
        {item.nome}
      </Text>
      <View
        className={`h-[22px] w-[22px] items-center justify-center rounded-[7px] ${item.selecionada ? "bg-marca-500" : "border-[1.5px] border-marca-100"}`}
      >
        {item.selecionada ? <Icone icone={Check} tamanho={14} cor="branco" /> : null}
      </View>
    </Pressable>
  );
}

export function EspecialidadesView({
  carregando,
  erroCarregamento,
  aoTentarDeNovo,
  busca,
  aoBuscar,
  contador,
  grupos,
  semResultado,
  aoAlternar,
  rotuloSalvar,
  podeSalvar,
  aoSalvar,
  aoVoltar,
}: EspecialidadesViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Especialidades" aoVoltar={aoVoltar} />

      {carregando ? (
        <Carregando />
      ) : erroCarregamento ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{erroCarregamento}</Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoTentarDeNovo}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-margem pb-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="h-botao flex-row items-center gap-2.5 rounded-campo border border-borda bg-superficie px-4">
            <Icone icone={Search} tamanho={18} cor="fraco" />
            <TextInput
              value={busca}
              onChangeText={aoBuscar}
              placeholder="Buscar categoria"
              placeholderTextColor="#7B87A4"
              selectionColor="#2159CC"
              className="h-full flex-1 text-corpo text-tinta"
              autoCorrect={false}
              accessibilityLabel="Buscar categoria"
            />
          </View>

          <Text className="text-rotulo text-tinta-suave">{contador}</Text>

          {semResultado ? (
            <Text className="py-6 text-center text-corpo text-tinta-suave">
              Nenhuma categoria encontrada.
            </Text>
          ) : null}

          {grupos.map((grupo) => (
            <View key={grupo.grupo} className="gap-2">
              <Text className="pt-1 text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
                {grupo.grupo}
              </Text>
              {grupo.itens.map((item) => (
                <LinhaEspecialidade key={item.id} item={item} aoAlternar={aoAlternar} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <View className="border-t border-borda bg-superficie px-margem py-4">
        <Botao rotulo={rotuloSalvar} onPress={aoSalvar} disabled={!podeSalvar} />
      </View>
    </SafeAreaView>
  );
}
