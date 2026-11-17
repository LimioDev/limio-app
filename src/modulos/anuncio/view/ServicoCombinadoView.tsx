import {
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  DollarSign,
  MapPin,
  Smartphone,
  Star,
} from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Badge } from "../../../comum/componentes/ui/Badge";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  EtapaServicoExibida,
  ServicoCombinadoExibido,
} from "../viewmodel/useServicoCombinadoViewModel";
import { CartaoConversa } from "./componentes/CartaoConversa";

interface ServicoCombinadoViewProps {
  servico: ServicoCombinadoExibido | null;
  carregando: boolean;
  erro: string | null;
  /** `false` quando o serviço não está disponível: troca "Tentar de novo" por "Voltar". */
  podeTentarDeNovo: boolean;
  atualizando: boolean;
  aoTentarDeNovo: () => void;
  aoAtualizar: () => void;
  aoVoltar: () => void;
  /** Sem telefone (conta encerrada), o número não aparece. */
  aoLigar?: () => void;
  /** Sem função, o card "Conversar com" aparece sem abrir o chat. */
  aoConversar?: () => void;
  /** Tela 27 "Validar serviço" (ETI-93). */
  aoValidar: () => void;
  aoAvaliar: () => void;
}

const TITULO = "Serviço combinado";

/** Uma etapa da linha "Andamento": círculo, ligação até a próxima e rótulo. */
function Etapa({
  etapa,
  primeira,
  ultima,
  ligacaoAntes,
  ligacaoDepois,
  encerrado,
}: {
  etapa: EtapaServicoExibida;
  primeira: boolean;
  ultima: boolean;
  /** Metade da ligação com a etapa anterior: azul quando esta já foi feita. */
  ligacaoAntes: boolean;
  /** Metade da ligação com a próxima: azul quando a próxima já foi feita. */
  ligacaoDepois: boolean;
  encerrado: boolean;
}) {
  const { situacao } = etapa;
  const feito = situacao === "feito";
  const atual = situacao === "atual";
  // Cancelado (25d): o que foi feito fica cinza, sem destaque.
  const corFeito = encerrado ? "bg-tinta-fraco" : "bg-marca-500";
  const ligacao = (visivel: boolean, cheia: boolean) => (
    <View
      className={`h-0.5 flex-1 ${visivel ? (cheia && !encerrado ? "bg-marca-500" : "bg-borda-campo") : "bg-transparent"}`}
    />
  );

  let corRotulo = "text-tinta-fraco";
  if (atual) {
    corRotulo = "font-bold text-marca-500";
  } else if (situacao === "proximo") {
    corRotulo = "font-bold text-tinta-suave";
  } else if (feito) {
    corRotulo = encerrado ? "text-tinta-fraco" : "text-tinta";
  }

  return (
    <View className="flex-1 items-center gap-2">
      <View className="w-full flex-row items-center">
        {ligacao(!primeira, ligacaoAntes)}
        {feito ? (
          <View className={`h-7 w-7 items-center justify-center rounded-full ${corFeito}`}>
            <Icone icone={Check} tamanho={14} cor="branco" />
          </View>
        ) : (
          <View
            className={`h-7 w-7 items-center justify-center rounded-full border-2 bg-superficie ${
              atual ? "border-marca-500" : "border-borda-campo"
            }`}
          >
            {atual ? <View className="h-3 w-3 rounded-full bg-marca-500" /> : null}
          </View>
        )}
        {ligacao(!ultima, ligacaoDepois)}
      </View>
      <Text className={`text-rotulo ${corRotulo}`}>{etapa.rotulo}</Text>
    </View>
  );
}

/** Telas 25 "Serviço combinado" do Empregador e variantes 25b a 25e. */
export function ServicoCombinadoView({
  servico,
  carregando,
  erro,
  podeTentarDeNovo,
  atualizando,
  aoTentarDeNovo,
  aoAtualizar,
  aoVoltar,
  aoLigar,
  aoConversar,
  aoValidar,
  aoAvaliar,
}: ServicoCombinadoViewProps) {
  if (!servico) {
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

  const { prestador, conversa, etapas } = servico;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-fundo">
      {/* Menu "⋮" com "Denunciar" (tela 25f) entra com o ETI-115. */}
      <CabecalhoVoltar titulo={TITULO} aoVoltar={aoVoltar} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-margem pb-8 pt-3"
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} />}
      >
        <View className="flex-row items-center gap-3 rounded-destaque bg-marca-800 p-4">
          <View className="flex-1 gap-1.5">
            {/* O par de "combinado" é o próprio fundo do card: aqui ele usa o
                azul de "em andamento", como no protótipo. */}
            <Badge
              estado={servico.estado === "combinado" ? "andamento" : servico.estado}
              rotulo={servico.estado === "combinado" ? "Combinado" : undefined}
            />
            <Text className="text-secao font-bold text-white" accessibilityRole="header">
              {servico.dia}
            </Text>
            <Text className="text-rotulo text-marca-100">{servico.quando}</Text>
          </View>
          <Icone icone={CalendarDays} tamanho={22} cor="marca-clara" />
        </View>

        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <Avatar nome={prestador.nome} fotoUrl={prestador.fotoUrl} tamanho={48} />
            {/* Média e estrelas voltam quando a API trouxer a média (ETI-86). */}
            <Text className="flex-1 text-corpo font-bold text-tinta">{prestador.nome}</Text>
            {prestador.gold ? (
              <View className="self-start rounded-full bg-gold-fundo px-2.5 py-1">
                <Text className="text-overline font-bold text-gold">GOLD</Text>
              </View>
            ) : null}
          </View>
          {prestador.telefone ? (
            <Pressable
              onPress={aoLigar}
              disabled={!aoLigar}
              accessibilityRole="link"
              accessibilityLabel={`Ligar para ${prestador.telefone}`}
              className="flex-row items-center gap-3 border-t border-borda pt-4 active:opacity-70"
            >
              <Icone icone={Smartphone} tamanho={18} cor="marca" />
              <Text className="flex-1 text-corpo font-bold text-tinta">{prestador.telefone}</Text>
            </Pressable>
          ) : null}
        </Card>

        {servico.endereco ? (
          <Card className="flex-row gap-3">
            <Icone icone={MapPin} tamanho={18} cor="marca" />
            <View className="flex-1 gap-0.5">
              <Text className="text-corpo font-bold text-tinta">{servico.endereco}</Text>
              {servico.bairro ? (
                <Text className="text-rotulo text-tinta-fraco">{servico.bairro}</Text>
              ) : null}
            </View>
          </Card>
        ) : null}

        <CartaoConversa
          titulo={conversa.titulo}
          detalhe={conversa.detalhe}
          aoConversar={aoConversar}
        />

        <Card className="flex-row items-center gap-3">
          <Icone icone={DollarSign} tamanho={16} cor="fraco" />
          <View className="flex-1 gap-0.5">
            <Text className="text-corpo font-bold text-tinta">Valor combinado</Text>
            <Text className="text-rotulo text-tinta-fraco">
              Opcional e informativo — o LIMIO não cobra
            </Text>
          </View>
          {/* "Informar" fica no app (decisão do PO em 26/10), mas ainda não tem card. */}
          {servico.encerrado ? null : (
            <Text className="text-corpo font-bold text-marca-500">Informar</Text>
          )}
        </Card>

        <View className="gap-3 pt-1">
          <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
            Andamento
          </Text>
          <View className="flex-row" accessibilityRole="list">
            {etapas.map((etapa, indice) => (
              <Etapa
                key={etapa.rotulo}
                etapa={etapa}
                primeira={indice === 0}
                ultima={indice === etapas.length - 1}
                ligacaoAntes={etapa.situacao === "feito"}
                ligacaoDepois={etapas[indice + 1]?.situacao === "feito"}
                encerrado={servico.encerrado}
              />
            ))}
          </View>
        </View>

        {servico.propostaPendente ? (
          <View className="flex-row gap-3 rounded-card bg-alerta-fundo p-4">
            <Icone icone={CalendarClock} tamanho={18} cor="alerta" />
            <Text className="flex-1 text-rotulo text-alerta">{servico.propostaPendente}</Text>
          </View>
        ) : null}

        {/* Tela 27: cheio aguardando validação, contornado (presencial) antes do check-out. */}
        {servico.acoes.validar ? (
          <Botao
            rotulo="Validar serviço"
            icone={CircleCheck}
            variante={servico.acoes.validar === "checkout" ? "primario" : "contorno"}
            onPress={aoValidar}
          />
        ) : null}
        {/* "Reagendar" (ETI-100) e "Cancelar" (ETI-95) entram com os cards
            deles; as regras já estão em `servico.acoes`. */}
        {servico.podeAvaliar ? (
          <Botao rotulo={servico.rotuloAvaliar} icone={Star} onPress={aoAvaliar} />
        ) : null}

        {servico.rodape ? (
          servico.encerrado ? (
            <View className="rounded-card bg-perigo-fundo p-4">
              <Text className="text-rotulo text-perigo">{servico.rodape}</Text>
            </View>
          ) : (
            <Text className="text-rotulo text-tinta-fraco">{servico.rodape}</Text>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
