import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Chip } from "../../../../comum/componentes/ui/Chip";
import { ControleDeslizante } from "../../../../comum/componentes/ui/ControleDeslizante";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type { QuandoMural } from "../../tipos/anuncio.enums";
import type { FolhaFiltrosExibida } from "../../viewmodel/useMuralViewModel";

interface FolhaFiltrosMuralProps {
  folha: FolhaFiltrosExibida;
  aoFechar: () => void;
  aoLimpar: () => void;
  aoAplicar: () => void;
  aoExpandirCategorias: () => void;
  aoAlternarCategoria: (id: string) => void;
  aoMudarRaio: (km: number) => void;
  aoEscolherQuando: (quando: QuandoMural) => void;
}

function TituloSecao({ children }: { children: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {children}
    </Text>
  );
}

/** Tela 28a: folha de baixo com categorias, raio e "Quando". */
export function FolhaFiltrosMural({
  folha,
  aoFechar,
  aoLimpar,
  aoAplicar,
  aoExpandirCategorias,
  aoAlternarCategoria,
  aoMudarRaio,
  aoEscolherQuando,
}: FolhaFiltrosMuralProps) {
  return (
    <Modal
      visible={folha.aberta}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          onPress={aoFechar}
          accessibilityLabel="Fechar filtros"
          className="absolute inset-0 bg-marca-900/40"
        />
        <SafeAreaView
          edges={["bottom"]}
          className="max-h-[90%] rounded-t-sheet bg-superficie"
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-marca-100" />
          </View>
          <ScrollView contentContainerClassName="gap-5 px-margem pb-4 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
                Filtros
              </Text>
              <Text
                onPress={aoLimpar}
                accessibilityRole="button"
                className="text-corpo font-semibold text-marca-500"
              >
                Limpar
              </Text>
            </View>

            <View className="gap-2.5">
              <TituloSecao>Categorias</TituloSecao>
              <Pressable
                onPress={aoExpandirCategorias}
                accessibilityRole="button"
                accessibilityState={{ expanded: folha.categoriasExpandidas }}
                className="flex-row items-center gap-3 rounded-campo border border-borda p-3 active:opacity-70"
              >
                <View className="h-10 w-10 items-center justify-center rounded-chip bg-marca-50">
                  <Icone icone={LayoutGrid} tamanho={18} cor="marca" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-corpo font-bold text-tinta" numberOfLines={1}>
                    {folha.resumoCategorias}
                  </Text>
                  <Text className="text-rotulo text-tinta-suave">
                    {folha.contagemCategorias}
                  </Text>
                </View>
                <Icone
                  icone={folha.categoriasExpandidas ? ChevronDown : ChevronRight}
                  tamanho={20}
                  cor="suave"
                />
              </Pressable>
              {folha.categoriasExpandidas ? (
                <View className="flex-row flex-wrap gap-2">
                  {folha.categorias.map((categoria) => (
                    <Chip
                      key={categoria.id}
                      rotulo={categoria.nome}
                      selecionado={categoria.selecionada}
                      onPress={() => aoAlternarCategoria(categoria.id)}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <TituloSecao>Raio de atendimento</TituloSecao>
                <Text className="text-corpo font-bold text-marca-500">{folha.raioKm} km</Text>
              </View>
              <ControleDeslizante
                valor={folha.raioKm}
                min={folha.raioMinimoKm}
                max={folha.raioMaximoKm}
                aoMudar={aoMudarRaio}
                rotuloAcessivel="Raio de atendimento"
                textoValor={`${folha.raioKm} km`}
              />
            </View>

            <View className="gap-2.5">
              <TituloSecao>Quando</TituloSecao>
              <View className="flex-row flex-wrap gap-2">
                {folha.quando.map((opcao) => (
                  <Pressable
                    key={opcao.valor}
                    onPress={() => aoEscolherQuando(opcao.valor)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: opcao.selecionado }}
                    className={`h-10 justify-center rounded-chip border px-3.5 ${opcao.selecionado ? "border-marca-500 bg-marca-50" : "border-borda-campo bg-superficie"}`}
                  >
                    <Text
                      className={`text-rotulo ${opcao.selecionado ? "font-bold text-marca-600" : "font-medium text-tinta-suave"}`}
                    >
                      {opcao.rotulo}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="rounded-campo bg-marca-50 p-4">
              <Text className="text-rotulo text-tinta-suave">
                O horário declarado no seu perfil filtra a lista, mas não bloqueia nenhum
                anúncio do mural.
              </Text>
            </View>
          </ScrollView>
          <View className="px-margem pb-4 pt-2">
            <Botao rotulo={folha.rotuloVer} onPress={aoAplicar} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
