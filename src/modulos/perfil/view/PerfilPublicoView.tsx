import { ChevronLeft, Flag, Star } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Card } from "../../../comum/componentes/ui/Card";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Chip } from "../../../comum/componentes/ui/Chip";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  AvaliacaoExibida,
  PerfilPublicoExibido,
} from "../viewmodel/usePerfilPublicoViewModel";

interface PerfilPublicoViewProps {
  carregando: boolean;
  erro: string | null;
  aoTentarDeNovo: () => void;
  atualizando: boolean;
  aoAtualizar: () => void;
  perfil: PerfilPublicoExibido | null;
  aoVoltar: () => void;
  aoDenunciar: () => void;
  /** Tela 20a; `null` é a 20b, sem botões. */
  acoes: { aoConversar: () => void; aoEscolher?: () => void } | null;
  mostrarAvisoConsulta: boolean;
}

const formatoNota = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Estrelas({ nota, tamanho }: { nota: number; tamanho: number }) {
  const cheias = Math.round(Math.min(Math.max(nota, 0), 5));
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((posicao) => (
        <Icone
          key={posicao}
          icone={Star}
          tamanho={tamanho}
          cor={posicao <= cheias ? "estrela" : "fraco"}
          preenchimento={posicao <= cheias ? "estrela" : undefined}
        />
      ))}
    </View>
  );
}

function Cabecalho({
  aoVoltar,
  aoDenunciar,
}: {
  aoVoltar: () => void;
  aoDenunciar?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-margem pt-2">
      <Pressable
        onPress={aoVoltar}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="h-toque w-8 items-center justify-center"
      >
        <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
      </Pressable>
      {aoDenunciar ? (
        <Pressable
          onPress={aoDenunciar}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Denunciar perfil"
          className="h-toque w-8 items-center justify-center"
        >
          <Icone icone={Flag} tamanho={22} cor="tinta" />
        </Pressable>
      ) : null}
    </View>
  );
}

function Contador({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <Card className="flex-1 gap-0.5">
      <Text className="text-titulo font-bold text-marca-800">{valor}</Text>
      <Text className="text-rotulo text-tinta-fraco">{rotulo}</Text>
    </Card>
  );
}

function CartaoAvaliacao({ avaliacao }: { avaliacao: AvaliacaoExibida }) {
  return (
    <Card
      className="gap-1.5"
      accessible
      accessibilityLabel={`${avaliacao.nome}, nota ${avaliacao.nota} de 5, em ${avaliacao.data}. ${avaliacao.comentario ?? ""}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-corpo font-bold text-tinta" numberOfLines={1}>
          {avaliacao.nome}
        </Text>
        <Text className="text-rotulo text-tinta-fraco">{avaliacao.data}</Text>
      </View>
      <Estrelas nota={avaliacao.nota} tamanho={14} />
      {avaliacao.comentario ? (
        <Text className="text-corpo text-tinta-suave">{avaliacao.comentario}</Text>
      ) : null}
    </Card>
  );
}

/**
 * Telas 20a "Perfil público do candidato" e 20b "Perfil público (consulta)".
 * Mesmo conteúdo; a 20a tem "Conversar" e "Escolher" no rodapé, a 20b um
 * aviso no lugar deles.
 */
export function PerfilPublicoView({
  carregando,
  erro,
  aoTentarDeNovo,
  atualizando,
  aoAtualizar,
  perfil,
  aoVoltar,
  aoDenunciar,
  acoes,
  mostrarAvisoConsulta,
}: PerfilPublicoViewProps) {
  if (carregando || erro || !perfil) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <Cabecalho aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">
              {erro ?? "Não foi possível carregar o perfil."}
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

  const temRodape = !!acoes || mostrarAvisoConsulta;

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={temRodape ? ["top"] : ["top", "bottom"]}>
      <Cabecalho aoVoltar={aoVoltar} aoDenunciar={aoDenunciar} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-margem pb-8 pt-3"
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} />}
      >
        <View className="flex-row items-center gap-4">
          <Avatar
            nome={perfil.nome}
            fotoUrl={perfil.fotoUrl}
            cacheKey={perfil.fotoCacheKey}
            tamanho={80}
          />
          <View className="flex-1 gap-1">
            <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
              {perfil.nome}
            </Text>
            {perfil.reputacao ? (
              <View
                className="flex-row items-center gap-2"
                accessible
                accessibilityLabel={`Nota ${formatoNota.format(perfil.reputacao.nota)} de 5`}
              >
                <Estrelas nota={perfil.reputacao.nota} tamanho={16} />
                <Text className="text-corpo font-bold text-tinta">
                  {formatoNota.format(perfil.reputacao.nota)}
                </Text>
              </View>
            ) : (
              <Text className="text-corpo text-tinta-suave">Sem avaliações ainda</Text>
            )}
            <Text className="text-rotulo text-tinta-fraco">{perfil.resumo}</Text>
          </View>
        </View>

        {perfil.especialidades.length > 0 ? (
          <View className="flex-row flex-wrap gap-2" accessibilityLabel="Especialidades">
            {perfil.especialidades.map((especialidade) => (
              <Chip key={especialidade} rotulo={especialidade} />
            ))}
          </View>
        ) : null}

        <View className="flex-row gap-3">
          <Contador valor={perfil.servicosConcluidos} rotulo={perfil.rotuloServicos} />
          <Contador valor={perfil.avaliacoes} rotulo={perfil.rotuloAvaliacoes} />
        </View>

        {/* Sem avaliação, o "Sem avaliações ainda" do topo já diz tudo. */}
        {perfil.avaliacoesRecentes.length > 0 ? (
          <View className="gap-3">
            <Text
              className="text-overline font-bold uppercase text-tinta-fraco"
              accessibilityRole="header"
            >
              Avaliações recentes
            </Text>
            {perfil.avaliacoesRecentes.map((avaliacao) => (
              <CartaoAvaliacao key={avaliacao.chave} avaliacao={avaliacao} />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {temRodape ? (
        <SafeAreaView edges={["bottom"]} className="border-t border-borda bg-superficie">
          <View className="px-margem py-4">
            {acoes ? (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Botao rotulo="Conversar" variante="contorno" onPress={acoes.aoConversar} />
                </View>
                <View className="flex-1">
                  <Botao
                    rotulo="Escolher"
                    disabled={!acoes.aoEscolher}
                    onPress={acoes.aoEscolher}
                    accessibilityHint={acoes.aoEscolher ? undefined : "Disponível em breve"}
                  />
                </View>
              </View>
            ) : (
              <View className="rounded-campo bg-marca-50 p-4">
                <Text className="text-rotulo text-tinta-suave">
                  Conversar e escolher só aparecem quando esta pessoa é candidata a um anúncio
                  seu.
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}
