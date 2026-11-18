import { CreditCard, Crown } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../../comum/componentes/ui/Badge";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { AssinaturaGoldViewModel } from "../viewmodel/useAssinaturaGoldViewModel";

/** Tela 35 "Assinatura GOLD" (mínima): GOLD ativo e a forma de pagamento. */
export function AssinaturaGoldView({
  carregando,
  erro,
  tentandoDeNovo,
  aoTentarDeNovo,
  assinatura,
  aoVoltar,
}: AssinaturaGoldViewModel) {
  let conteudo;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (erro || !assinatura) {
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
        <View className="gap-3 rounded-destaque bg-marca-800 p-5">
          <View className="flex-row items-center justify-between">
            <Badge estado="andamento" rotulo="Ativa" />
            <Icone icone={Crown} tamanho={20} cor="estrela" />
          </View>
          <View className="gap-1">
            <Text className="text-[17px] font-bold leading-[22px] text-white">
              Combinações ilimitadas
            </Text>
            <Text className="text-rotulo text-marca-100">{assinatura.resumo}</Text>
          </View>
        </View>

        {assinatura.cartao ? (
          <View className="gap-3">
            <Text className="text-overline font-bold uppercase text-tinta-fraco">
              Forma de pagamento
            </Text>
            <Card className="flex-row items-center gap-3">
              <View className="h-10 w-12 items-center justify-center rounded-campo bg-marca-50">
                <Icone icone={CreditCard} tamanho={20} cor="marca" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-corpo font-bold text-tinta">{assinatura.cartao}</Text>
                <Text className="text-rotulo text-tinta-fraco">Só é usado para a assinatura</Text>
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Assinatura GOLD" aoVoltar={aoVoltar} />
      {conteudo}
    </SafeAreaView>
  );
}
