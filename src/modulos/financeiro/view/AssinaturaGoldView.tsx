import { CreditCard, Crown, TriangleAlert } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../../comum/componentes/ui/Badge";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  AssinaturaGoldExibida,
  AssinaturaGoldViewModel,
} from "../viewmodel/useAssinaturaGoldViewModel";
import { FolhaCancelarRenovacao } from "./componentes/FolhaCancelarRenovacao";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="text-overline font-bold uppercase text-tinta-fraco">{titulo}</Text>
      {children}
    </View>
  );
}

function CartaoStatus({ assinatura }: { assinatura: AssinaturaGoldExibida }) {
  return (
    <View className="gap-3 rounded-destaque bg-marca-800 p-5">
      <View className="flex-row items-center justify-between">
        <Badge estado="andamento" rotulo={assinatura.selo} />
        <Icone icone={Crown} tamanho={20} cor="estrela" />
      </View>
      <View className="gap-1">
        <Text className="text-[17px] font-bold leading-[22px] text-white">
          Combinações ilimitadas
        </Text>
        <Text className="text-rotulo text-marca-100">{assinatura.resumo}</Text>
      </View>
    </View>
  );
}

function AlertaRecusado({ novaTentativaEm }: { novaTentativaEm: string }) {
  return (
    <View
      className="flex-row gap-3 rounded-card bg-alerta-fundo p-4"
      accessibilityRole="alert"
    >
      <Icone icone={TriangleAlert} tamanho={18} cor="alerta" />
      <View className="flex-1 gap-0.5">
        <Text className="text-corpo font-bold text-alerta">
          Ação necessária: Pagamento recusado
        </Text>
        <Text className="text-rotulo text-alerta">
          Cartão recusado. Nova tentativa em {novaTentativaEm}. Atualize os dados para não voltar
          ao plano gratuito.
        </Text>
      </View>
    </View>
  );
}

/**
 * Tela 35 "Assinatura GOLD": status, alerta de cobrança recusada, forma de
 * pagamento, cobranças e "Cancelar renovação" (ou "Assinar de novo").
 */
export function AssinaturaGoldView({
  carregando,
  erro,
  semAssinatura,
  tentandoDeNovo,
  aoTentarDeNovo,
  assinatura,
  aoTrocarCartao,
  aoAssinar,
  confirmandoCancelamento,
  cancelando,
  erroCancelamento,
  aoPedirCancelamento,
  aoManterRenovacao,
  aoConfirmarCancelamento,
  aoVoltar,
}: AssinaturaGoldViewModel) {
  let conteudo;
  if (carregando) {
    conteudo = <Carregando />;
  } else if (semAssinatura) {
    conteudo = (
      <View className="flex-1 items-center justify-center gap-4 px-margem">
        <Text className="text-center text-corpo text-tinta-suave">
          Você não tem uma assinatura GOLD ativa.
        </Text>
        <Botao rotulo="Conhecer o GOLD" variante="contorno" tamanho="padrao" onPress={aoAssinar} />
      </View>
    );
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
      <ScrollView contentContainerClassName="gap-5 px-margem pb-8 pt-4">
        <CartaoStatus assinatura={assinatura} />

        {assinatura.novaTentativaEm ? (
          <AlertaRecusado novaTentativaEm={assinatura.novaTentativaEm} />
        ) : null}

        <Secao titulo="Forma de pagamento">
          <Card className="flex-row items-center gap-3">
            <View className="h-10 w-12 items-center justify-center rounded-campo bg-marca-50">
              <Icone icone={CreditCard} tamanho={20} cor="marca" />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-corpo font-bold text-tinta">
                {assinatura.cartao ?? "Nenhum cartão salvo"}
              </Text>
              <Text className="text-rotulo text-tinta-fraco">Só é usado para a assinatura</Text>
            </View>
            <Pressable
              onPress={aoTrocarCartao}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={assinatura.cartao ? "Trocar cartão" : "Adicionar cartão"}
            >
              <Text className="text-rotulo font-bold text-marca-500">
                {assinatura.cartao ? "Trocar" : "Adicionar"}
              </Text>
            </Pressable>
          </Card>
        </Secao>

        {assinatura.cobrancas.length > 0 ? (
          <Secao titulo="Cobranças">
            <View className="rounded-card border border-borda bg-superficie px-4">
              {assinatura.cobrancas.map((cobranca, indice) => (
                <View
                  key={`${cobranca.data}-${indice}`}
                  className={`flex-row items-center justify-between gap-3 py-4 ${indice > 0 ? "border-t border-borda" : ""}`}
                >
                  <Text className="text-corpo text-tinta">{cobranca.data}</Text>
                  <Text
                    className={`flex-1 text-right text-rotulo ${cobranca.recusada ? "text-perigo" : "text-tinta-fraco"}`}
                  >
                    {cobranca.detalhe}
                  </Text>
                </View>
              ))}
            </View>
          </Secao>
        ) : null}

        {assinatura.renovacaoCancelada ? (
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-corpo font-bold text-tinta">
                GOLD até {assinatura.ateQuando}
              </Text>
              <Text className="text-rotulo text-tinta-suave">
                A renovação foi cancelada. Após essa data, sua conta voltará ao limite gratuito de
                4 serviços por mês.
              </Text>
            </View>
            <Botao rotulo="Assinar de novo" variante="contorno" tamanho="padrao" onPress={aoAssinar} />
          </View>
        ) : (
          <View className="gap-1">
            <Pressable
              onPress={aoPedirCancelamento}
              hitSlop={8}
              accessibilityRole="button"
              className="self-start active:opacity-70"
            >
              <Text className="text-corpo font-bold text-perigo">Cancelar renovação</Text>
            </Pressable>
            <Text className="text-rotulo text-tinta-fraco">
              Seu plano continuará ativo até {assinatura.ateQuando}. Após essa data, sua conta
              voltará ao limite gratuito de 4 serviços por mês.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Assinatura GOLD" aoVoltar={aoVoltar} />
      {conteudo}
      <FolhaCancelarRenovacao
        visivel={confirmandoCancelamento}
        ateQuando={assinatura?.ateQuando ?? ""}
        cancelando={cancelando}
        erro={erroCancelamento}
        aoConfirmar={aoConfirmarCancelamento}
        aoManter={aoManterRenovacao}
      />
    </SafeAreaView>
  );
}
