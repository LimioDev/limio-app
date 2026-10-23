import { ChevronRight, Mail, MapPin, Settings, Smartphone, User } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { Reputacao } from "../../../comum/componentes/ui/Reputacao";
import type { PerfilExibido } from "../viewmodel/useMeuPerfilViewModel";
import { LinhaPerfil } from "./componentes/LinhaPerfil";

interface MeuPerfilViewProps {
  perfil: PerfilExibido | null;
  carregando: boolean;
  erro: string | null;
  atualizando: boolean;
  aoAtualizar: () => void;
  papelAtivo: { rotulo: string; descricao: string };
  /** `null` fora do papel Prestador. */
  atuacao: { resumo: string; incompleto: boolean } | null;
  /** Resumo dos endereços salvos; `null` fora do papel Empregador. */
  enderecos: string | null;
  aoAbrirAjustes: () => void;
  aoTrocarPapel: () => void;
  aoEditarContato: () => void;
  aoAbrirAtuacao: () => void;
  aoAbrirEnderecos: () => void;
}

function TituloSecao({ children }: { children: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {children}
    </Text>
  );
}

export function MeuPerfilView({
  perfil,
  carregando,
  erro,
  atualizando,
  aoAtualizar,
  papelAtivo,
  atuacao,
  enderecos,
  aoAbrirAjustes,
  aoTrocarPapel,
  aoEditarContato,
  aoAbrirAtuacao,
  aoAbrirEnderecos,
}: MeuPerfilViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <View className="flex-row items-center justify-between px-margem pt-2">
        <Text className="text-secao font-bold text-tinta">Meu perfil</Text>
        <Pressable
          onPress={aoAbrirAjustes}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
          className="h-toque w-toque items-center justify-center"
        >
          <Icone icone={Settings} tamanho={24} cor="tinta" />
        </Pressable>
      </View>

      {carregando ? (
        <Carregando />
      ) : !perfil ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoAtualizar}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-margem pb-8 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={aoAtualizar}
              tintColor="#2159CC"
              colors={["#2159CC"]}
            />
          }
        >
          <View className="flex-row items-center gap-4">
            <Avatar nome={perfil.nomeExibicao} tamanho={72} />
            <View className="flex-1 gap-1">
              <Text className="text-[20px] font-bold text-tinta" numberOfLines={2}>
                {perfil.nomeExibicao}
              </Text>
              {perfil.avaliacoes ? (
                <Reputacao
                  nota={perfil.avaliacoes.nota}
                  totalAvaliacoes={perfil.avaliacoes.total}
                />
              ) : (
                <Text className="text-rotulo text-tinta-suave">Sem avaliações</Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-3 rounded-card bg-marca-800 py-4 pl-4 pr-3">
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-bold text-white">
                Papel ativo: {papelAtivo.rotulo}
              </Text>
              <Text className="text-rotulo text-marca-100">{papelAtivo.descricao}</Text>
            </View>
            <Pressable
              onPress={aoTrocarPapel}
              accessibilityRole="button"
              className="h-[34px] items-center justify-center rounded-chip bg-marca-500 px-4 active:opacity-80"
            >
              <Text className="text-[13px] font-bold text-white">Trocar papel</Text>
            </Pressable>
          </View>

          {atuacao ? (
            <View className="gap-2.5">
              <TituloSecao>Atuação</TituloSecao>
              <Pressable
                onPress={aoAbrirAtuacao}
                accessibilityRole="button"
                className="flex-row items-center gap-3 rounded-campo border border-borda bg-superficie px-4 py-3.5 active:opacity-70"
              >
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-corpo font-bold text-tinta">
                      Perfil de atuação
                    </Text>
                    {atuacao.incompleto ? (
                      <View className="rounded-full bg-alerta-fundo px-2 py-0.5">
                        <Text className="text-overline font-bold uppercase text-alerta">
                          Incompleto
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-rotulo text-tinta-fraco" numberOfLines={2}>
                    {atuacao.resumo}
                  </Text>
                </View>
                <Icone icone={ChevronRight} tamanho={20} cor="suave" />
              </Pressable>
            </View>
          ) : null}

          <View className="gap-2.5">
            <TituloSecao>Dados de contato</TituloSecao>
            <View className="rounded-card border border-borda bg-superficie">
              <LinhaPerfil
                icone={User}
                rotulo="Nome de exibição"
                valor={perfil.nomeExibicao}
                onPress={aoEditarContato}
              />
              <LinhaPerfil
                icone={Mail}
                rotulo="E-mail de contato"
                valor={perfil.email}
                onPress={aoEditarContato}
                comDivisoria
              />
              <LinhaPerfil
                icone={Smartphone}
                rotulo="Telefone"
                valor={perfil.telefone}
                onPress={aoEditarContato}
                comDivisoria
              />
              {enderecos !== null ? (
                <LinhaPerfil
                  icone={MapPin}
                  rotulo="Endereços salvos"
                  valor={enderecos}
                  onPress={aoAbrirEnderecos}
                  comDivisoria
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
