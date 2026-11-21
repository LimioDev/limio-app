import {
  CalendarDays,
  ChevronDown,
  Clock,
  LayoutList,
  RefreshCw,
  type LucideIcon,
} from "lucide-react-native";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks, type Mask } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import {
  MENSAGEM_DATA_FUTURA,
  type ErrosPropostaReagendamento,
  type PropostaReagendamentoExibida,
} from "../viewmodel/useProporReagendamentoViewModel";
import { CampoContador } from "./componentes/CampoContador";

const MASCARA_HORA: Mask = [/\d/, /\d/, ":", /\d/, /\d/];

const TITULO = "Propor reagendamento";

/** Ícone de cada informação, na ordem do protótipo: prazo, contador e mural. */
const ICONES_INFORMACAO: [LucideIcon, LucideIcon, LucideIcon] = [Clock, RefreshCw, LayoutList];

interface ProporReagendamentoViewProps {
  proposta: PropostaReagendamentoExibida | null;
  carregando: boolean;
  /** Falha ao carregar, serviço indisponível ou que não pode mais ser reagendado. */
  erro: string | null;
  /** `false` quando o problema não se resolve tentando de novo: só "Voltar". */
  podeTentarDeNovo: boolean;
  atualizando: boolean;
  aoTentarDeNovo: () => void;
  data: string;
  aoMudarData: (texto: string) => void;
  hora: string;
  aoMudarHora: (texto: string) => void;
  /** "Sexta, 5 de setembro · 09:00" quando data e hora já formam um instante. */
  previaNovaData: string | null;
  justificativa: string;
  aoMudarJustificativa: (texto: string) => void;
  erros: ErrosPropostaReagendamento;
  erroServidor: string | null;
  enviando: boolean;
  aoEnviar: () => void;
  aoVoltar: () => void;
}

function Overline({ children, cor = "text-tinta-fraco" }: { children: string; cor?: string }) {
  return (
    <Text className={`text-overline font-bold uppercase tracking-[0.8px] ${cor}`}>{children}</Text>
  );
}

/** Tela 40 "Propor reagendamento" (ETI-100). */
export function ProporReagendamentoView({
  proposta,
  carregando,
  erro,
  podeTentarDeNovo,
  atualizando,
  aoTentarDeNovo,
  data,
  aoMudarData,
  hora,
  aoMudarHora,
  previaNovaData,
  justificativa,
  aoMudarJustificativa,
  erros,
  erroServidor,
  enviando,
  aoEnviar,
  aoVoltar,
}: ProporReagendamentoViewProps) {
  if (!proposta) {
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <CabecalhoVoltar titulo={TITULO} aoVoltar={aoVoltar} />
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

  // "Precisa ser uma data futura" é a dica do card; só vira erro (vermelho) quando falha.
  const erroData = erros.data && erros.data !== MENSAGEM_DATA_FUTURA ? erros.data : undefined;
  const dataNoPassado = erros.data === MENSAGEM_DATA_FUTURA;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-fundo">
      <CabecalhoVoltar titulo={TITULO} aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-margem pb-6 pt-3"
          keyboardShouldPersistTaps="handled"
        >
          <Card className="gap-1">
            <Overline>Data vigente</Overline>
            <Text className="text-corpo font-bold text-tinta">{proposta.dataVigente}</Text>
            <Text className="text-rotulo text-tinta-fraco">{proposta.combinadoCom}</Text>
          </Card>

          <View className="items-center" importantForAccessibility="no">
            <Icone icone={ChevronDown} tamanho={18} cor="marca" />
          </View>

          <View className="gap-3 rounded-card border-[1.5px] border-marca-100 bg-marca-50 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Overline cor="text-marca-600">Nova data proposta</Overline>
                <Text className="text-corpo font-bold text-marca-800">
                  {previaNovaData ?? "Escolha a data e a hora"}
                </Text>
              </View>
              <Icone icone={CalendarDays} tamanho={20} cor="marca" />
            </View>
            <View className="flex-row items-start gap-3">
              <View className="flex-1">
                <Campo
                  rotulo="Data"
                  value={data}
                  onChangeText={aoMudarData}
                  mask={Masks.DATE_DDMMYYYY}
                  keyboardType="number-pad"
                  placeholder="dd/mm/aaaa"
                  erro={erroData}
                />
              </View>
              <View className="flex-1">
                <Campo
                  rotulo="Hora"
                  value={hora}
                  onChangeText={aoMudarHora}
                  mask={MASCARA_HORA}
                  keyboardType="number-pad"
                  placeholder="hh:mm"
                  erro={erros.hora}
                />
              </View>
            </View>
            <Text
              className={`text-rotulo ${dataNoPassado ? "font-bold text-perigo" : "text-marca-600"}`}
              accessibilityLiveRegion={dataNoPassado ? "polite" : "none"}
            >
              {MENSAGEM_DATA_FUTURA}
            </Text>
          </View>

          <View className="pt-1">
            <CampoContador
              rotulo="Justificativa"
              dica="obrigatória"
              valor={justificativa}
              aoMudar={aoMudarJustificativa}
              placeholder="Conte por que precisa de outra data"
              multilinha
              erro={erros.justificativa}
            />
          </View>

          <View className="gap-4 pt-2">
            {proposta.informacoes.map((info, indice) => (
              <View key={info.titulo} className="flex-row gap-3">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-marca-50">
                  <Icone icone={ICONES_INFORMACAO[indice]} tamanho={14} cor="marca" />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-corpo font-bold text-tinta">{info.titulo}</Text>
                  <Text className="text-rotulo text-tinta-fraco">{info.texto}</Text>
                </View>
              </View>
            ))}
          </View>

          {erroServidor ? (
            <View className="rounded-card bg-perigo-fundo p-4" accessibilityLiveRegion="polite">
              <Text className="text-rotulo text-perigo">{erroServidor}</Text>
            </View>
          ) : null}
        </ScrollView>

        <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
          <View className="px-margem py-3">
            <Botao rotulo="Enviar proposta" carregando={enviando} onPress={aoEnviar} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
