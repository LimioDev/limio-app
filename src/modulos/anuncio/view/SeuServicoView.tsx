import {
  Check,
  CircleCheck,
  MapPin,
  MessageCircle,
  Smartphone,
  TriangleAlert,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  FolhaIniciarExibida,
  PassoServicoExibido,
  ServicoExibido,
} from "../viewmodel/useSeuServicoViewModel";
import { FolhaIniciarServico } from "./componentes/FolhaIniciarServico";

interface SeuServicoViewProps {
  servico: ServicoExibido | null;
  carregando: boolean;
  erro: string | null;
  /** `false` quando o serviço não é (mais) do Prestador: troca "Tentar de novo" por "Voltar". */
  podeTentarDeNovo: boolean;
  atualizando: boolean;
  aoTentarDeNovo: () => void;
  aoVoltar: () => void;
  /** Sem telefone (conta encerrada), os atalhos não aparecem. */
  aoLigar?: () => void;
  aoAbrirWhatsApp?: () => void;
  folha: FolhaIniciarExibida;
  aoIniciar: () => void;
  aoConfirmarInicio: () => void;
  aoFecharFolha: () => void;
}

function Aviso({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <View className="flex-row gap-3 rounded-card bg-alerta-fundo p-4" accessibilityRole="summary">
      <Icone icone={TriangleAlert} tamanho={18} cor="alerta" />
      <View className="flex-1 gap-0.5">
        <Text className="text-rotulo font-bold text-alerta">{titulo}</Text>
        {texto ? <Text className="text-rotulo text-alerta">{texto}</Text> : null}
      </View>
    </View>
  );
}

function Passo({ passo, ultimo }: { passo: PassoServicoExibido; ultimo: boolean }) {
  const feito = passo.situacao === "feito";
  const atual = passo.situacao === "atual";
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        {feito ? (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-marca-500">
            <Icone icone={Check} tamanho={14} cor="branco" />
          </View>
        ) : (
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
              atual ? "border-marca-500 bg-superficie" : "border-borda-campo bg-superficie"
            }`}
          >
            {atual ? <View className="h-2.5 w-2.5 rounded-full bg-marca-500" /> : null}
          </View>
        )}
        {ultimo ? null : (
          <View className={`w-0.5 flex-1 ${feito ? "bg-marca-500" : "bg-borda-campo"}`} />
        )}
      </View>
      <View className={`flex-1 gap-0.5 ${ultimo ? "" : "pb-4"}`}>
        <Text
          className={`text-corpo ${
            passo.situacao === "futuro"
              ? "text-tinta-fraco"
              : atual
                ? "font-bold text-tinta"
                : "text-tinta"
          }`}
        >
          {passo.titulo}
        </Text>
        <Text className="text-rotulo text-tinta-fraco">{passo.detalhe}</Text>
      </View>
    </View>
  );
}

/** Telas 36 "Seu serviço" (combinado) e 37 (em andamento) do Prestador escolhido. */
export function SeuServicoView({
  servico,
  carregando,
  erro,
  podeTentarDeNovo,
  atualizando,
  aoTentarDeNovo,
  aoVoltar,
  aoLigar,
  aoAbrirWhatsApp,
  folha,
  aoIniciar,
  aoConfirmarInicio,
  aoFecharFolha,
}: SeuServicoViewProps) {
  if (!servico) {
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <CabecalhoVoltar titulo="Seu serviço" aoVoltar={aoVoltar} />
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

  const { empregador } = servico;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-fundo">
      <CabecalhoVoltar titulo="Seu serviço" aoVoltar={aoVoltar} />

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-margem pb-6 pt-3">
        <View className="gap-2 rounded-destaque bg-marca-800 p-4">
          <View className="self-start rounded-full bg-marca-500 px-2.5 py-1.5">
            <Text className="text-overline font-bold uppercase text-white">{servico.selo}</Text>
          </View>
          <Text className="text-corpo font-bold text-white" accessibilityRole="header">
            {servico.titulo}
          </Text>
          <Text className="text-rotulo text-marca-100">{servico.quando}</Text>
        </View>

        <View className="gap-4 rounded-card border border-borda bg-superficie p-4">
          <View className="flex-row items-center gap-3">
            <Avatar nome={empregador.nome} fotoUrl={empregador.fotoUrl} />
            <View className="flex-1 gap-0.5">
              <Text className="text-corpo font-bold text-tinta">{empregador.nome}</Text>
              <Text className="text-rotulo text-tinta-fraco">Solicitante</Text>
            </View>
          </View>

          {empregador.telefone ? (
            <View className="flex-row items-center gap-3 border-t border-borda pt-4">
              <Icone icone={Smartphone} tamanho={18} cor="marca" />
              <Text
                onPress={aoLigar}
                accessibilityRole="link"
                accessibilityLabel={`Ligar para ${empregador.telefone}`}
                className="flex-1 text-corpo font-bold text-tinta"
              >
                {empregador.telefone}
              </Text>
              {aoAbrirWhatsApp ? (
                <Pressable
                  onPress={aoAbrirWhatsApp}
                  accessibilityRole="link"
                  accessibilityLabel="Abrir conversa no WhatsApp"
                  className="flex-row items-center gap-1.5 rounded-full bg-sucesso-fundo px-3 py-2 active:opacity-70"
                >
                  <Icone icone={MessageCircle} tamanho={16} cor="sucesso" />
                  <Text className="text-rotulo font-bold text-sucesso">WhatsApp</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {servico.endereco ? (
            <View className="flex-row gap-3">
              <Icone icone={MapPin} tamanho={18} cor="marca" />
              <View className="flex-1 gap-0.5">
                <Text className="text-corpo font-bold text-tinta">{servico.endereco}</Text>
                {servico.bairro ? (
                  <Text className="text-rotulo text-tinta-fraco">{servico.bairro}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {servico.andamento.length > 0 ? (
          <View className="gap-3">
            <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
              Andamento
            </Text>
            <View>
              {servico.andamento.map((passo, indice) => (
                <Passo
                  key={passo.titulo}
                  passo={passo}
                  ultimo={indice === servico.andamento.length - 1}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* "Você ainda pode cancelar o serviço." do protótipo entra com o ETI-97. */}
        {servico.emAndamento ? (
          <Aviso titulo="O Empregador não pode mais cancelar e ninguém pode reagendar." />
        ) : servico.podeIniciar ? (
          <Aviso
            titulo="Iniciar o serviço bloqueia cancelamentos"
            texto="Ao iniciar o serviço, a opção de cancelamento para o empregador é bloqueada e o reagendamento é desativado para ambos."
          />
        ) : null}
      </ScrollView>

      {/* "Finalizar com foto" (ETI-91), "Propor novo horário" (ETI-100) e
          "Cancelar serviço" (ETI-97) entram com os cards deles. */}
      {servico.podeIniciar ? (
        <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
          <View className="px-margem py-3">
            <Botao
              rotulo="Iniciar serviço"
              icone={CircleCheck}
              disabled={folha.enviando}
              onPress={aoIniciar}
            />
          </View>
        </SafeAreaView>
      ) : null}

      <FolhaIniciarServico
        folha={folha}
        aoConfirmar={aoConfirmarInicio}
        aoFechar={aoFecharFolha}
      />
    </SafeAreaView>
  );
}
