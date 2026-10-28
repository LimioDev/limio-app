import { Image } from "expo-image";
import {
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Reputacao } from "../../../comum/componentes/ui/Reputacao";
import type { DetalheMuralExibido } from "../viewmodel/useDetalheAnuncioMuralViewModel";

interface DetalheAnuncioMuralViewProps {
  anuncio: DetalheMuralExibido | null;
  carregando: boolean;
  erro: string | null;
  /** `false` quando o anúncio saiu do mural: troca "Tentar de novo" por "Voltar ao mural". */
  podeTentarDeNovo: boolean;
  atualizando: boolean;
  fotoAtual: number;
  aoMudarFoto: (indice: number) => void;
  aoTentarDeNovo: () => void;
  aoVoltar: () => void;
  aoAbrirChat: (aplicacaoId: string) => void;
  /** Sem handler, "Candidatar-se" fica desabilitado. */
  aoCandidatar?: () => void;
  /** Sem handler, "Ver perfil" não aparece (ETI-106). */
  aoVerPerfilEmpregador?: () => void;
}

const ALTURA_FOTOS = 250;

function BotaoVoltar({ aoVoltar }: { aoVoltar: () => void }) {
  return (
    <Pressable
      onPress={aoVoltar}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      className="h-10 w-10 items-center justify-center rounded-full bg-superficie active:opacity-70"
    >
      <Icone icone={ChevronLeft} tamanho={22} cor="tinta" />
    </Pressable>
  );
}

/** Carrossel do topo com o contador "1 / 3"; sem foto, o desenho do protótipo. */
function Fotos({
  fotos,
  fotoAtual,
  aoMudarFoto,
}: {
  fotos: string[];
  fotoAtual: number;
  aoMudarFoto: (indice: number) => void;
}) {
  const [largura, setLargura] = useState(0);

  return (
    <View
      style={{ height: ALTURA_FOTOS }}
      className="overflow-hidden bg-marca-50"
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
    >
      {fotos.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-marca-100" />
          <View className="absolute -right-4 -top-10 h-52 w-52 rounded-full border border-marca-100" />
          <Icone icone={ImageIcon} tamanho={32} cor="marca" />
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            if (largura > 0) {
              aoMudarFoto(Math.round(e.nativeEvent.contentOffset.x / largura));
            }
          }}
        >
          {fotos.map((url, indice) => (
            <Image
              key={url}
              source={{ uri: url }}
              style={{ width: largura, height: ALTURA_FOTOS }}
              contentFit="cover"
              accessibilityLabel={`Foto ${indice + 1} de ${fotos.length}`}
            />
          ))}
        </ScrollView>
      )}
      {fotos.length > 1 ? (
        <View className="absolute bottom-10 right-5 rounded-full bg-tinta/60 px-2.5 py-1">
          <Text className="text-micro font-bold text-white">
            {fotoAtual + 1} / {fotos.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Caixa de data ou local. `secundarioNaLinha`: "Qua, 03/09 14:00" numa linha só, como no protótipo. */
function CaixaInfo({
  icone,
  principal,
  secundario,
  secundarioNaLinha = false,
}: {
  icone: LucideIcon;
  principal: string;
  secundario: string;
  secundarioNaLinha?: boolean;
}) {
  return (
    <View className="flex-1 gap-1.5 rounded-campo border border-borda bg-superficie p-3.5">
      <Icone icone={icone} tamanho={18} cor="marca" />
      <Text className="text-corpo font-bold text-tinta" numberOfLines={1}>
        {principal}
        {secundarioNaLinha ? (
          <Text className="text-rotulo font-normal text-tinta-fraco"> {secundario}</Text>
        ) : null}
      </Text>
      {secundarioNaLinha ? null : (
        <Text className="text-rotulo text-tinta-fraco" numberOfLines={1}>
          {secundario}
        </Text>
      )}
    </View>
  );
}

/** Tela 30: detalhe do anúncio do mural, sem endereço completo nem contato. */
export function DetalheAnuncioMuralView({
  anuncio,
  carregando,
  erro,
  podeTentarDeNovo,
  atualizando,
  fotoAtual,
  aoMudarFoto,
  aoTentarDeNovo,
  aoVoltar,
  aoAbrirChat,
  aoCandidatar,
  aoVerPerfilEmpregador,
}: DetalheAnuncioMuralViewProps) {
  if (!anuncio) {
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <View className="px-margem pt-2">
          <BotaoVoltar aoVoltar={aoVoltar} />
        </View>
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
            {podeTentarDeNovo ? (
              <Botao
                rotulo="Tentar de novo"
                variante="contorno"
                tamanho="padrao"
                carregando={atualizando}
                onPress={aoTentarDeNovo}
              />
            ) : (
              <Botao
                rotulo="Voltar ao mural"
                variante="contorno"
                tamanho="padrao"
                onPress={aoVoltar}
              />
            )}
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { candidatura } = anuncio;

  return (
    <View className="flex-1 bg-fundo">
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        <Fotos fotos={anuncio.fotos} fotoAtual={fotoAtual} aoMudarFoto={aoMudarFoto} />

        <View className="-mt-6 gap-4 rounded-t-sheet bg-fundo px-margem pt-6">
          <View className="flex-row items-center gap-3">
            <View className="rounded-full bg-marca-50 px-2.5 py-1">
              <Text className="text-overline font-bold uppercase text-marca-600">
                {anuncio.categoria}
              </Text>
            </View>
            <Text className="text-rotulo text-tinta-fraco">{anuncio.distancia}</Text>
          </View>

          <Text className="text-[24px] font-bold leading-[30px] text-tinta" accessibilityRole="header">
            {anuncio.titulo}
          </Text>

          <View className="flex-row gap-3">
            <CaixaInfo
              icone={CalendarDays}
              principal={anuncio.dia}
              secundario={anuncio.hora}
              secundarioNaLinha
            />
            <CaixaInfo icone={MapPin} principal={anuncio.local} secundario={anuncio.cidadeUf} />
          </View>

          <View className="gap-1.5">
            <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
              Descrição
            </Text>
            <Text className="text-corpo text-tinta-suave">{anuncio.descricao}</Text>
          </View>

          <View className="flex-row items-center gap-3 rounded-card border border-borda bg-superficie p-4">
            <Avatar nome={anuncio.empregador.nome} fotoUrl={anuncio.empregador.fotoUrl} />
            <View className="flex-1 gap-1">
              <Text className="text-corpo font-bold text-tinta">{anuncio.empregador.nome}</Text>
              {anuncio.empregador.reputacao ? (
                <Reputacao
                  nota={anuncio.empregador.reputacao.nota}
                  totalAvaliacoes={anuncio.empregador.reputacao.totalAvaliacoes}
                />
              ) : (
                <Text className="text-rotulo text-tinta-fraco">Ainda sem avaliações</Text>
              )}
            </View>
            {aoVerPerfilEmpregador ? (
              <Text
                onPress={aoVerPerfilEmpregador}
                accessibilityRole="link"
                className="text-rotulo font-semibold text-marca-500"
              >
                Ver perfil
              </Text>
            ) : null}
          </View>

          {candidatura ? (
            <View
              className="flex-row gap-3 rounded-campo bg-sucesso-fundo p-4"
              accessibilityRole="summary"
            >
              <Icone icone={CircleCheck} tamanho={20} cor="sucesso" />
              <View className="flex-1 gap-0.5">
                <Text className="text-corpo font-bold text-sucesso">{candidatura.titulo}</Text>
                <Text className="text-rotulo text-sucesso">{candidatura.descricao}</Text>
              </View>
            </View>
          ) : null}

          <View className="flex-row items-center gap-3 rounded-campo bg-marca-50 p-4">
            <Icone icone={Lock} tamanho={16} cor="marca-escura" />
            <Text className="flex-1 text-rotulo text-marca-800">
              Endereço completo e telefone aparecem apenas se você for o escolhido.
            </Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
        <View className="px-margem py-3">
          {candidatura ? (
            <Botao
              rotulo="Abrir chat"
              icone={MessageSquare}
              onPress={() => aoAbrirChat(candidatura.aplicacaoId)}
            />
          ) : (
            <Botao rotulo="Candidatar-se" onPress={aoCandidatar} disabled={!aoCandidatar} />
          )}
        </View>
      </SafeAreaView>

      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 items-start px-margem pt-2"
      >
        <BotaoVoltar aoVoltar={aoVoltar} />
      </SafeAreaView>
    </View>
  );
}
