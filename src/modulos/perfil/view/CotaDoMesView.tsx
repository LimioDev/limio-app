import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import type { CotaDoMesViewModel, CotaExibida } from "../viewmodel/useCotaDoMesViewModel";

function CartaoCota({ cota }: { cota: CotaExibida }) {
  return (
    <View className="gap-4 rounded-destaque bg-marca-800 p-5">
      <Text className="text-overline font-bold text-marca-300">{cota.mes}</Text>
      <View className="flex-row items-end gap-3">
        <Text className="text-[34px] font-bold leading-[40px] tracking-[-0.6px] text-white">
          {cota.destaque}
        </Text>
        <Text className="pb-1.5 text-corpo text-marca-100">{cota.complemento}</Text>
      </View>
      {cota.segmentos.length > 0 ? (
        <View
          className="flex-row gap-2"
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: cota.segmentos.length,
            now: cota.segmentos.filter(Boolean).length,
          }}
        >
          {cota.segmentos.map((usado, indice) => (
            <View
              key={indice}
              className={`h-1.5 flex-1 rounded-full ${usado ? "bg-marca-300" : "bg-marca-700"}`}
            />
          ))}
        </View>
      ) : null}
      <Text className="text-rotulo text-marca-100">{cota.renovacao}</Text>
    </View>
  );
}

export function CotaDoMesView({
  carregando,
  erro,
  tentandoDeNovo,
  cota,
  aoTentarDeNovo,
  aoVoltar,
}: CotaDoMesViewModel) {
  let conteudo;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (erro || !cota) {
    conteudo = (
      <View className="flex-1 items-center justify-center gap-4 px-margem">
        <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
        <Botao
          rotulo="Tentar de novo"
          variante="contorno"
          tamanho="padrao"
          carregando={tentandoDeNovo}
          onPress={aoTentarDeNovo}
        />
      </View>
    );
  } else {
    conteudo = (
      <ScrollView contentContainerClassName="gap-6 px-margem pb-8 pt-4">
        <CartaoCota cota={cota} />
        <View className="gap-1.5">
          <Text className="text-secao font-bold text-tinta">{cota.titulo}</Text>
          <Text className="text-corpo text-tinta-suave">{cota.texto}</Text>
        </View>
        <View className="gap-2">
          <Text className="text-overline font-bold uppercase text-tinta-fraco">
            Onde você usou sua cota:
          </Text>
          {cota.escolhas.length === 0 ? (
            <Text className="text-corpo text-tinta-suave">
              Nenhuma escolha usada neste mês.
            </Text>
          ) : (
            cota.escolhas.map((escolha) => (
              <Card key={escolha.id} className="gap-0.5 px-4 py-3">
                <Text className="text-corpo text-tinta" numberOfLines={1}>
                  {escolha.titulo}
                </Text>
                <Text className="text-rotulo text-tinta-fraco">{escolha.detalhe}</Text>
              </Card>
            ))
          )}
        </View>
        {/* "Conhecer o GOLD" e "Combinações ilimitadas por R$ 29,90/mês" ficam
            de fora até a tela 34 "Assinatura" (ETI-82) entrar. */}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Cota do mês" aoVoltar={aoVoltar} />
      {conteudo}
    </SafeAreaView>
  );
}
