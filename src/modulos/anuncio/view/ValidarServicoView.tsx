import { Image } from "expo-image";
import { CircleCheck, DollarSign, ImageIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../../comum/componentes/ui/Badge";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  FotoCheckoutExibida,
  ValidacaoExibida,
} from "../viewmodel/useValidarServicoViewModel";

interface ValidarServicoViewProps {
  validacao: ValidacaoExibida | null;
  carregando: boolean;
  erro: string | null;
  /** `false` quando o serviço não está disponível ou já foi validado: troca por "Voltar". */
  podeTentarDeNovo: boolean;
  tentandoDeNovo: boolean;
  aoTentarDeNovo: () => void;
  enviando: boolean;
  erroEnvio: string | null;
  aoValidar: () => void;
  aoVoltar: () => void;
  /** "Algo deu errado? Abrir denúncia" (tela 46). */
  aoDenunciar: () => void;
}

const TITULO = "Validar serviço";
const ALTURA_FOTO = 200;

/** Desenho do protótipo no lugar da foto (sem foto ou sem link do storage). */
function SemFoto() {
  return (
    <View className="flex-1 items-center justify-center">
      <Icone icone={ImageIcon} tamanho={40} cor="marca" />
    </View>
  );
}

/** Fotos do check-out, uma por página, com "1 / 3" quando há mais de uma. */
function FotosDoCheckout({ fotos }: { fotos: FotoCheckoutExibida[] }) {
  const [largura, setLargura] = useState(0);
  const [atual, setAtual] = useState(0);

  return (
    <View
      style={{ height: ALTURA_FOTO }}
      className="overflow-hidden rounded-card border border-marca-100 bg-marca-50"
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
    >
      {fotos.length === 0 ? (
        <SemFoto />
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            if (largura > 0) {
              setAtual(Math.round(e.nativeEvent.contentOffset.x / largura));
            }
          }}
        >
          {fotos.map((foto, indice) => (
            <View key={foto.chave} style={{ width: largura, height: ALTURA_FOTO }}>
              {foto.url ? (
                <Image
                  source={{ uri: foto.url }}
                  style={{ width: largura, height: ALTURA_FOTO }}
                  contentFit="cover"
                  accessibilityLabel={`Foto ${indice + 1} de ${fotos.length} do check-out`}
                />
              ) : (
                <SemFoto />
              )}
            </View>
          ))}
        </ScrollView>
      )}
      <View className="absolute bottom-3 left-3 rounded-full bg-tinta/60 px-2.5 py-1">
        <Text className="text-micro font-bold text-white">Foto do check-out</Text>
      </View>
      {fotos.length > 1 ? (
        <View className="absolute bottom-3 right-3 rounded-full bg-tinta/60 px-2.5 py-1">
          <Text className="text-micro font-bold text-white">
            {atual + 1} / {fotos.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Tela 27 "Validar serviço" do Empregador e a variante 27b, sem check-out. */
export function ValidarServicoView({
  validacao,
  carregando,
  erro,
  podeTentarDeNovo,
  tentandoDeNovo,
  aoTentarDeNovo,
  enviando,
  erroEnvio,
  aoValidar,
  aoVoltar,
  aoDenunciar,
}: ValidarServicoViewProps) {
  if (!validacao) {
    return (
      <SafeAreaView className="flex-1 bg-fundo">
        <CabecalhoVoltar titulo={TITULO} aoVoltar={aoVoltar} />
        {carregando || !erro ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
            <Botao
              rotulo={podeTentarDeNovo ? "Tentar de novo" : "Voltar"}
              variante="contorno"
              tamanho="padrao"
              carregando={podeTentarDeNovo && tentandoDeNovo}
              onPress={podeTentarDeNovo ? aoTentarDeNovo : aoVoltar}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo={TITULO} aoVoltar={aoVoltar} />

      <ScrollView className="flex-1" contentContainerClassName="gap-5 px-margem pb-6 pt-2">
        <View className="items-start gap-2">
          <Badge estado={validacao.estado} />
          <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
            {validacao.titulo}
          </Text>
          <Text className="text-corpo text-tinta-fraco">{validacao.subtitulo}</Text>
        </View>

        {validacao.comCheckout ? <FotosDoCheckout fotos={validacao.fotos} /> : null}

        <Card className="gap-3">
          <Text className="text-corpo font-bold text-tinta">Como você quer validar?</Text>
          {/* Um modo só, o que a API aceita no status (ETI-92): sem escolha. */}
          <View className="h-10 items-center justify-center rounded-campo bg-marca-500">
            <Text className="text-rotulo font-bold text-white">{validacao.modo}</Text>
          </View>
          {validacao.dicaModo ? (
            <Text className="text-rotulo text-tinta-fraco">{validacao.dicaModo}</Text>
          ) : null}
        </Card>

        <View className="flex-row gap-3 rounded-card bg-alerta-fundo p-4" accessibilityRole="summary">
          <Icone icone={DollarSign} tamanho={16} cor="alerta" />
          <View className="flex-1 gap-0.5">
            <Text className="text-corpo font-bold text-alerta">Validar não paga o prestador</Text>
            {/* Texto da 27c: o valor combinado ainda não é guardado pela API. */}
            <Text className="text-rotulo text-alerta">
              O LIMIO não retém nem transfere valores. Depois de validar, pague o valor combinado
              por PIX, dinheiro ou transferência.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="gap-2 px-margem pb-3 pt-2">
        {erroEnvio ? (
          <Text className="text-center text-rotulo text-perigo">{erroEnvio}</Text>
        ) : null}
        <Botao
          rotulo="Validar serviço"
          icone={CircleCheck}
          onPress={aoValidar}
          disabled={enviando}
          carregando={enviando}
        />
        <Pressable
          onPress={aoDenunciar}
          disabled={enviando}
          accessibilityRole="link"
          className="h-toque items-center justify-center active:opacity-70"
        >
          <Text className="text-rotulo font-semibold text-tinta-suave">
            Algo deu errado? Abrir denúncia
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
