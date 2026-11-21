import { ArrowRight, CircleAlert, Clock, ShieldCheck } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  AcaoEmAndamento,
  PropostaRecebidaExibida,
} from "../viewmodel/useRespostaReagendamentoViewModel";

interface RespostaReagendamentoViewProps {
  proposta: PropostaRecebidaExibida | null;
  carregando: boolean;
  erro: string | null;
  /** `false` quando a proposta ou o serviço não estão disponíveis: só "Voltar". */
  podeTentarDeNovo: boolean;
  atualizando: boolean;
  aoTentarDeNovo: () => void;
  acaoEmAndamento: AcaoEmAndamento;
  erroAcao: string | null;
  aoAceitar: () => void;
  aoRecusar: () => void;
  aoCancelarProposta: () => void;
  aoVoltar: () => void;
}

const TITULO_PADRAO = "Proposta recebida";

function Overline({ children, cor = "text-tinta-fraco" }: { children: string; cor?: string }) {
  return (
    <Text className={`text-overline font-bold uppercase tracking-[0.8px] ${cor}`}>{children}</Text>
  );
}

/** Tela 41 "Proposta recebida" (ETI-100); pro proponente, "Proposta enviada" com "Cancelar proposta". */
export function RespostaReagendamentoView({
  proposta,
  carregando,
  erro,
  podeTentarDeNovo,
  atualizando,
  aoTentarDeNovo,
  acaoEmAndamento,
  erroAcao,
  aoAceitar,
  aoRecusar,
  aoCancelarProposta,
  aoVoltar,
}: RespostaReagendamentoViewProps) {
  if (!proposta) {
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <CabecalhoVoltar titulo={TITULO_PADRAO} aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
            <Botao
              rotulo={podeTentarDeNovo ? "Tentar de novo" : "Voltar"}
              variante="contorno"
              tamanho="padrao"
              carregando={podeTentarDeNovo && atualizando}
              onPress={podeTentarDeNovo ? aoTentarDeNovo : aoVoltar}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { aviso, pessoa } = proposta;
  const ocupado = acaoEmAndamento !== null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-fundo">
      <CabecalhoVoltar titulo={proposta.titulo} aoVoltar={aoVoltar} />

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-margem pb-6 pt-3">
        <View
          className={`flex-row gap-3 rounded-card p-4 ${aviso.encerrada ? "bg-perigo-fundo" : "bg-alerta-fundo"}`}
          accessibilityRole="summary"
        >
          <Icone
            icone={aviso.encerrada ? CircleAlert : Clock}
            tamanho={18}
            cor={aviso.encerrada ? "perigo" : "alerta"}
          />
          <View className="flex-1 gap-0.5">
            <Text
              className={`text-rotulo font-bold ${aviso.encerrada ? "text-perigo" : "text-alerta"}`}
            >
              {aviso.titulo}
            </Text>
            {aviso.texto ? <Text className="text-rotulo text-alerta">{aviso.texto}</Text> : null}
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <Avatar nome={pessoa.nome} fotoUrl={pessoa.fotoUrl} tamanho={44} />
          <View className="flex-1 gap-0.5">
            <Text className="text-corpo font-bold text-tinta">{pessoa.nome}</Text>
            <Text className="text-rotulo text-tinta-fraco">{pessoa.texto}</Text>
          </View>
        </View>

        <Card className="gap-3">
          <View className="gap-1">
            <Overline>De</Overline>
            <Text className="text-corpo text-tinta-fraco">{proposta.de}</Text>
          </View>
          <View className="flex-row items-center gap-2" importantForAccessibility="no">
            <View className="h-px flex-1 bg-borda" />
            <Icone icone={ArrowRight} tamanho={18} cor="marca" />
          </View>
          <View className="gap-1">
            <Overline cor="text-marca-600">Para</Overline>
            <Text className="text-corpo font-bold text-marca-800">{proposta.para}</Text>
          </View>
        </Card>

        {proposta.justificativa ? (
          <View className="gap-1">
            <Overline>Justificativa</Overline>
            <Text className="text-corpo text-tinta">{`“${proposta.justificativa}”`}</Text>
          </View>
        ) : null}

        {proposta.mostrarOQueMuda ? (
          <View className="flex-row gap-3 rounded-card bg-marca-50 p-4">
            <Icone icone={ShieldCheck} tamanho={18} cor="marca" />
            <View className="flex-1 gap-1">
              <Text className="text-rotulo font-bold text-marca-800">
                O que muda se você aceitar:
              </Text>
              <Text className="text-rotulo text-marca-800">
                • Prazos de conclusão acompanham a nova data
              </Text>
              <Text className="text-rotulo text-marca-800">
                • Cancelar nas próximas 24h não estorna a cota do prestador.
              </Text>
            </View>
          </View>
        ) : null}

        {erroAcao ? (
          <View className="rounded-card bg-perigo-fundo p-4" accessibilityLiveRegion="polite">
            <Text className="text-rotulo text-perigo">{erroAcao}</Text>
          </View>
        ) : null}
      </ScrollView>

      {proposta.acoes ? (
        <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
          {proposta.acoes === "responder" ? (
            <View className="flex-row gap-3 px-margem py-3">
              <View className="flex-1">
                <Botao
                  rotulo="Recusar"
                  variante="neutro"
                  carregando={acaoEmAndamento === "recusar"}
                  disabled={ocupado}
                  onPress={aoRecusar}
                />
              </View>
              <View className="flex-1">
                <Botao
                  rotulo="Aceitar"
                  carregando={acaoEmAndamento === "aceitar"}
                  disabled={ocupado}
                  onPress={aoAceitar}
                />
              </View>
            </View>
          ) : (
            <View className="px-margem py-3">
              <Botao
                rotulo="Cancelar proposta"
                variante="destrutivo"
                carregando={acaoEmAndamento === "cancelar"}
                disabled={ocupado}
                onPress={aoCancelarProposta}
              />
            </View>
          )}
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}
