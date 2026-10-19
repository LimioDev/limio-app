import { ChevronRight, MapPin } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { FaixaJanela } from "../servico/atuacao.helpers";
import type { ErrosAtuacao } from "../store/rascunhoAtuacao.store";
import { AreaAtendimento } from "./componentes/AreaAtendimento";
import { CabecalhoVoltar } from "./componentes/CabecalhoVoltar";
import { ControleDeslizante } from "./componentes/ControleDeslizante";

interface PerfilAtuacaoViewProps {
  carregando: boolean;
  erroCarregamento: string | null;
  aoTentarDeNovo: () => void;
  especialidades: string[];
  /** "3 de 8"; `null` enquanto as categorias não carregaram. */
  contadorEspecialidades: string | null;
  semEspecialidades: boolean;
  raio: number;
  raioMin: number;
  raioMax: number;
  aoMudarRaio: (raio: number) => void;
  municipio: string | null;
  janelas: FaixaJanela[];
  erros: ErrosAtuacao;
  erroServidor: string | null;
  salvando: boolean;
  aoSalvar: () => void;
  aoVoltar: () => void;
  aoEscolherEspecialidades: () => void;
  aoEscolherMunicipio: () => void;
  aoEditarJanelas: () => void;
}

function TituloSecao({ titulo, direita }: { titulo: string; direita?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
        {titulo}
      </Text>
      {direita}
    </View>
  );
}

function ErroCampo({ mensagem }: { mensagem?: string }) {
  return mensagem ? <Text className="text-rotulo text-perigo">{mensagem}</Text> : null;
}

export function PerfilAtuacaoView({
  carregando,
  erroCarregamento,
  aoTentarDeNovo,
  especialidades,
  contadorEspecialidades,
  semEspecialidades,
  raio,
  raioMin,
  raioMax,
  aoMudarRaio,
  municipio,
  janelas,
  erros,
  erroServidor,
  salvando,
  aoSalvar,
  aoVoltar,
  aoEscolherEspecialidades,
  aoEscolherMunicipio,
  aoEditarJanelas,
}: PerfilAtuacaoViewProps) {
  const pronto = !carregando && !erroCarregamento;

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar
        titulo="Perfil de atuação"
        aoVoltar={aoVoltar}
        direita={
          pronto ? (
            <Pressable
              onPress={aoSalvar}
              disabled={salvando}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityState={{ disabled: salvando, busy: salvando }}
              className="h-toque min-w-toque items-end justify-center"
            >
              {salvando ? (
                <ActivityIndicator color="#2159CC" />
              ) : (
                <Text className="text-[14.5px] font-bold text-marca-500">Salvar</Text>
              )}
            </Pressable>
          ) : null
        }
      />

      {carregando ? (
        <Carregando />
      ) : erroCarregamento ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{erroCarregamento}</Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoTentarDeNovo}
          />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-6 px-margem pb-8 pt-4">
          {erroServidor ? (
            <View className="rounded-card bg-perigo-fundo p-4">
              <Text className="text-rotulo text-perigo">{erroServidor}</Text>
            </View>
          ) : null}

          <View className="gap-3">
            <TituloSecao
              titulo="Especialidades"
              direita={
                contadorEspecialidades ? (
                  <Text className="text-[11.5px] font-bold text-tinta-fraco">
                    {contadorEspecialidades}
                  </Text>
                ) : null
              }
            />
            {especialidades.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {especialidades.map((nome) => (
                  <View
                    key={nome}
                    className="h-9 justify-center rounded-chip border border-marca-100 bg-marca-50 px-4"
                  >
                    <Text className="text-[13.5px] font-bold text-marca-500">{nome}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Pressable
              onPress={aoEscolherEspecialidades}
              accessibilityRole="button"
              className={`flex-row items-center gap-3 rounded-campo border bg-superficie px-4 py-2.5 active:opacity-70 ${erros.especialidades ? "border-perigo" : "border-borda"}`}
            >
              <View className="flex-1 gap-0.5">
                <Text className="text-corpo font-bold text-tinta">Escolher especialidades</Text>
                <Text className="text-rotulo text-tinta-fraco">
                  define quais anúncios aparecem no seu mural
                </Text>
              </View>
              <Icone icone={ChevronRight} tamanho={20} cor="suave" />
            </Pressable>
            <ErroCampo mensagem={erros.especialidades} />
            {semEspecialidades && !erros.especialidades ? (
              <View className="rounded-card bg-alerta-fundo p-4">
                <Text className="text-rotulo text-alerta">
                  Sem especialidades, nenhum anúncio aparece no seu mural. Você pode
                  salvar assim e escolher depois.
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-3">
            <TituloSecao
              titulo="Raio de atendimento"
              direita={
                <Text className="text-[13.5px] font-bold text-marca-600">{raio} km</Text>
              }
            />
            <AreaAtendimento raio={raio} raioMax={raioMax} />
            <View>
              <ControleDeslizante
                valor={raio}
                min={raioMin}
                max={raioMax}
                aoMudar={aoMudarRaio}
                rotuloAcessivel="Raio de atendimento"
                textoValor={`${raio} km`}
              />
              <View className="flex-row justify-between">
                <Text className="text-[11.5px] text-tinta-fraco">{raioMin} km</Text>
                <Text className="text-[11.5px] text-tinta-fraco">{raioMax} km</Text>
              </View>
            </View>
            <ErroCampo mensagem={erros.raio} />
          </View>

          <View className="gap-1.5">
            <Text className="text-rotulo font-bold text-tinta-suave">Município-base</Text>
            <Pressable
              onPress={aoEscolherMunicipio}
              accessibilityRole="button"
              accessibilityLabel={`Município-base: ${municipio ?? "não escolhido"}`}
              className={`h-campo flex-row items-center gap-2.5 rounded-campo border bg-superficie px-4 active:opacity-70 ${erros.municipio ? "border-perigo" : "border-borda-campo"}`}
            >
              <Icone icone={MapPin} tamanho={18} cor="fraco" />
              <Text
                className={`flex-1 text-corpo ${municipio ? "text-tinta" : "text-tinta-fraco"}`}
              >
                {municipio ?? "Escolha seu município"}
              </Text>
              <Icone icone={ChevronRight} tamanho={18} cor="suave" />
            </Pressable>
            <ErroCampo mensagem={erros.municipio} />
            {/* Atribuição exigida pela política do Nominatim, que a API usa pra localizar o município. */}
            <Text className="text-micro text-tinta-fraco">
              Localização do município: © OpenStreetMap contributors
            </Text>
          </View>

          <View className="gap-3">
            <TituloSecao titulo="Janelas de horário" />
            <Pressable
              onPress={aoEditarJanelas}
              accessibilityRole="button"
              accessibilityLabel="Editar janelas de horário"
              className="gap-2 active:opacity-70"
            >
              {janelas.length > 0 ? (
                janelas.map((faixa) => (
                  <View
                    key={`${faixa.dias}${faixa.horario}`}
                    className="h-[52px] flex-row items-center justify-between rounded-campo border border-borda bg-superficie px-4"
                  >
                    <Text className="text-[14.5px] text-tinta">{faixa.dias}</Text>
                    <Text className="text-[13.5px] font-bold text-marca-600">
                      {faixa.horario}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="h-[52px] flex-row items-center justify-between rounded-campo border border-borda bg-superficie px-4">
                  <Text className="text-[14.5px] text-tinta-fraco">Nenhum horário definido</Text>
                  <Icone icone={ChevronRight} tamanho={18} cor="suave" />
                </View>
              )}
            </Pressable>
            <ErroCampo mensagem={erros.janelas} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
