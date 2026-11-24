import { Check, CreditCard, Crown, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { AssinarGoldViewModel, PlanoGoldExibido } from "../viewmodel/useAssinarGoldViewModel";

const BENEFICIOS = [
  {
    titulo: "Combinações ilimitadas",
    texto: "Ultrapasse o limite gratuito de 4 serviços ao mês.",
  },
  {
    titulo: "Sem bloqueio por cota",
    texto: "Com a cota FREE cheia você para de se candidatar. Com GOLD, não para.",
  },
];

const NAO_MUDA = [
  "Acesso ao mesmo mural de serviços do plano gratuito.",
  "Seu perfil aparece na listagem padrão.",
];

function CartaoPlano({ plano }: { plano: PlanoGoldExibido }) {
  return (
    <View className="gap-2 rounded-destaque bg-marca-800 p-5">
      <Icone icone={Crown} tamanho={20} cor="estrela" />
      <Text className="text-[22px] font-bold leading-[28px] text-white">LIMIO GOLD</Text>
      <View className="flex-row items-end gap-2">
        <Text className="text-titulo font-bold text-white">{plano.preco}</Text>
        {plano.ciclo ? (
          <Text className="pb-1 text-corpo text-marca-100">{plano.ciclo}</Text>
        ) : null}
        <Text className="flex-1 pb-1 text-right text-rotulo text-marca-100">
          cancele quando quiser
        </Text>
      </View>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-overline font-bold uppercase text-tinta-fraco">{titulo}</Text>
      {children}
    </View>
  );
}

/** Tela 34 "Assinatura": o que o GOLD oferece, cartão salvo e "Assinar GOLD". */
export function AssinarGoldView({
  carregando,
  erro,
  tentandoDeNovo,
  aoTentarDeNovo,
  plano,
  podeAssinar,
  enviando,
  erroEnvio,
  recusado,
  aoAssinar,
  aoTrocarCartao,
  aoVoltar,
}: AssinarGoldViewModel) {
  if (carregando || erro || !plano) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <CabecalhoVoltar titulo="Assinatura" aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
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
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Assinatura" aoVoltar={aoVoltar} />

      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-margem pb-6 pt-4">
        <CartaoPlano plano={plano} />

        <Secao titulo="Benefícios:">
          {BENEFICIOS.map((beneficio) => (
            <View key={beneficio.titulo} className="flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-sucesso-fundo">
                <Icone icone={Check} tamanho={14} cor="sucesso" />
              </View>
              <View className="flex-1">
                <Text className="text-corpo font-semibold text-tinta">{beneficio.titulo}</Text>
                <Text className="text-corpo text-tinta">{beneficio.texto}</Text>
              </View>
            </View>
          ))}
        </Secao>

        <Secao titulo="O que não muda:">
          {NAO_MUDA.map((texto) => (
            <View key={texto} className="flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-borda">
                <Icone icone={X} tamanho={12} cor="fraco" />
              </View>
              <Text className="flex-1 text-corpo text-tinta-suave">{texto}</Text>
            </View>
          ))}
        </Secao>

        <View className="gap-2">
          <Card className="flex-row items-center gap-3">
            <View className="h-10 w-12 items-center justify-center rounded-campo bg-marca-50">
              <Icone icone={CreditCard} tamanho={20} cor="marca" />
            </View>
            <View className="flex-1 gap-0.5">
              {plano.cartao ? (
                <>
                  <Text className="text-corpo font-bold text-tinta">{plano.cartao.rotulo}</Text>
                  <Text className="text-rotulo text-tinta-fraco">{plano.cartao.cobranca}</Text>
                </>
              ) : (
                <>
                  <Text className="text-corpo font-bold text-tinta">Nenhum cartão salvo</Text>
                  <Text className="text-rotulo text-tinta-fraco">
                    Cadastre um cartão para assinar
                  </Text>
                </>
              )}
            </View>
            <Pressable
              onPress={aoTrocarCartao}
              disabled={enviando}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={plano.cartao ? "Trocar cartão" : "Adicionar cartão"}
            >
              <Text className="text-rotulo font-bold text-marca-500">
                {plano.cartao ? "Trocar" : "Adicionar"}
              </Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      <View className="gap-2 border-t border-borda bg-superficie px-margem py-3">
        {erroEnvio ? (
          <View className="items-center gap-1">
            <Text className="text-center text-rotulo text-perigo" accessibilityRole="alert">
              {erroEnvio}
            </Text>
            {recusado ? (
              <Pressable onPress={aoTrocarCartao} hitSlop={8} accessibilityRole="button">
                <Text className="text-rotulo font-bold text-marca-500">Trocar cartão</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Botao
          rotulo="Assinar GOLD"
          onPress={aoAssinar}
          disabled={!podeAssinar}
          carregando={enviando}
        />
        <Text className="text-center text-rotulo text-tinta-fraco">
          Renovação automática · cancele a qualquer momento
        </Text>
      </View>
    </SafeAreaView>
  );
}
