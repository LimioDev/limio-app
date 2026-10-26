import { ChevronLeft, Clock, MapPin, User } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Badge } from "../../../comum/componentes/ui/Badge";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { AnuncioPublicadoExibido } from "../viewmodel/useAnuncioPublicadoViewModel";
import { GradeFotos } from "./componentes/GradeFotos";

interface AnuncioPublicadoViewProps {
  carregando: boolean;
  erro: string | null;
  aoTentarDeNovo: () => void;
  anuncio: AnuncioPublicadoExibido | null;
  atualizando: boolean;
  aoAtualizar: () => void;
  aoVoltar: () => void;
}

function LinhaDetalhe({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-1.5">
      <Text className="text-rotulo text-tinta-fraco">{rotulo}</Text>
      <Text className="flex-shrink text-right text-rotulo font-bold text-tinta">{valor}</Text>
    </View>
  );
}

function Cabecalho({
  anuncio,
  aoVoltar,
}: {
  anuncio: AnuncioPublicadoExibido;
  aoVoltar: () => void;
}) {
  return (
    <View className="gap-3 overflow-hidden bg-marca-800 px-margem pb-7 pt-2">
      {/* Anéis decorativos do protótipo. */}
      <View className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <View className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />

      <Pressable
        onPress={aoVoltar}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="mb-2 h-toque w-8 items-center justify-center"
      >
        <Icone icone={ChevronLeft} tamanho={24} cor="branco" />
      </Pressable>

      <Badge estado={anuncio.estado} />
      <Text className="text-titulo font-bold text-white" accessibilityRole="header">
        {anuncio.titulo}
      </Text>
      <View className="flex-row flex-wrap items-center gap-x-5 gap-y-1">
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#C2CEF4" strokeWidth={1.7} absoluteStrokeWidth />
          <Text className="text-rotulo text-marca-100">{anuncio.quando}</Text>
        </View>
        {anuncio.local ? (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#C2CEF4" strokeWidth={1.7} absoluteStrokeWidth />
            <Text className="text-rotulo text-marca-100">{anuncio.local}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function AnuncioPublicadoView({
  carregando,
  erro,
  aoTentarDeNovo,
  anuncio,
  atualizando,
  aoAtualizar,
  aoVoltar,
}: AnuncioPublicadoViewProps) {
  if (carregando || erro || !anuncio) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <CabecalhoVoltar titulo="Anúncio" aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">
              {erro ?? "Não foi possível carregar o anúncio."}
            </Text>
            <Botao
              rotulo="Tentar de novo"
              variante="contorno"
              tamanho="padrao"
              onPress={aoTentarDeNovo}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-marca-800" edges={["top"]}>
      <ScrollView
        className="flex-1 bg-fundo"
        contentContainerClassName="pb-6"
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} />}
      >
        <Cabecalho anuncio={anuncio} aoVoltar={aoVoltar} />

        <View className="gap-5 px-margem pt-5">
          {anuncio.temCandidatos ? (
            <Card className="flex-row items-center gap-3">
              <View className="flex-1 gap-2.5">
                <View className="flex-row">
                  {anuncio.avatares.map((avatar, indice) => (
                    <View
                      key={avatar.chave}
                      className={`rounded-full border-2 border-superficie ${indice > 0 ? "-ml-2.5" : ""}`}
                    >
                      <Avatar nome={avatar.nome} fotoUrl={avatar.fotoUrl} tamanho={36} />
                    </View>
                  ))}
                </View>
                <Text className="text-corpo font-bold text-tinta">{anuncio.resumoCandidatos}</Text>
              </View>
              {/* Lista de candidatos é a tela 18 (ETI-67/68), ainda sem rota. */}
              <Botao
                rotulo="Ver todos"
                tamanho="padrao"
                disabled
                accessibilityHint="Disponível em breve"
              />
            </Card>
          ) : (
            // Tela 16b: sem candidatos, sem "Ver todos".
            <Card className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-chip bg-marca-50">
                <Icone icone={User} tamanho={20} cor="marca" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-corpo font-bold text-tinta">
                  Nenhum prestador se candidatou ainda
                </Text>
                <Text className="text-rotulo text-tinta-fraco">
                  Você recebe um aviso quando alguém se candidatar.
                </Text>
              </View>
            </Card>
          )}

          <View className="gap-2">
            <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
              Descrição
            </Text>
            <Text className="text-corpo text-tinta-suave">{anuncio.descricao}</Text>
          </View>

          {anuncio.fotos.length > 0 ? <GradeFotos fotos={anuncio.fotos} /> : null}

          <View className="border-t border-borda pt-3">
            <LinhaDetalhe rotulo="Endereço" valor="Liberado só após a escolha" />
            {anuncio.tamanhoLocal ? (
              <LinhaDetalhe rotulo="Tamanho do local" valor={anuncio.tamanhoLocal} />
            ) : null}
            {anuncio.pessoasNoLocal ? (
              <LinhaDetalhe rotulo="Pessoas no local" valor={anuncio.pessoasNoLocal} />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="bg-fundo">
        {/* Editar (ETI-61/62) e Cancelar (ETI-63/64) chegam nos cards deles. */}
        <View className="flex-row gap-3 border-t border-borda px-margem py-4">
          <View className="flex-1">
            <Botao rotulo="Editar" variante="neutro" disabled accessibilityHint="Disponível em breve" />
          </View>
          <View className="flex-1">
            <Botao
              rotulo="Cancelar"
              variante="destrutivo"
              disabled
              accessibilityHint="Disponível em breve"
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
