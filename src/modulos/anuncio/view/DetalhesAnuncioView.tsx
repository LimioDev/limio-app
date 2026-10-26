import { CalendarDays, CircleDollarSign, Clock, ShieldAlert } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks, type Mask } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { CORES_ICONE, Icone } from "../../../comum/componentes/ui/Icone";
import type { ErrosAnuncio } from "../store/rascunhoAnuncio.store";
import type { OpcaoEndereco } from "../viewmodel/useDetalhesAnuncioViewModel";
import { CabecalhoPasso } from "./componentes/CabecalhoPasso";
import { CampoContador } from "./componentes/CampoContador";

const MASCARA_HORA: Mask = [/\d/, /\d/, ":", /\d/, /\d/];

interface DetalhesAnuncioViewProps {
  data: string;
  aoMudarData: (texto: string) => void;
  hora: string;
  aoMudarHora: (texto: string) => void;
  carregandoEnderecos: boolean;
  erroEnderecos: string | null;
  aoRecarregarEnderecos: () => void;
  opcoesEndereco: OpcaoEndereco[];
  aoEscolherEndereco: (chave: string) => void;
  temAvulso: boolean;
  aoUsarOutroEndereco: () => void;
  tamanhoLocal: string;
  aoMudarTamanhoLocal: (texto: string) => void;
  tamanhoLocalMax: number;
  numeroPessoas: string;
  aoMudarNumeroPessoas: (texto: string) => void;
  observacoes: string;
  aoMudarObservacoes: (texto: string) => void;
  erros: ErrosAnuncio;
  erroServidor: string | null;
  avisoContatos: string | null;
  aoConfirmarContatos: () => void;
  publicando: boolean;
  aoPublicar: () => void;
  aoVoltar: () => void;
}

function Overline({ children }: { children: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {children}
    </Text>
  );
}

function CartaoEnderecoOpcao({
  opcao,
  aoEscolher,
}: {
  opcao: OpcaoEndereco;
  aoEscolher: (chave: string) => void;
}) {
  return (
    <Pressable
      onPress={() => aoEscolher(opcao.chave)}
      accessibilityRole="radio"
      accessibilityState={{ checked: opcao.selecionado }}
      accessibilityLabel={`${opcao.titulo}, ${opcao.linha}`}
      className={`flex-row items-center gap-3 rounded-campo bg-superficie px-4 py-3.5 active:opacity-80 ${opcao.selecionado ? "border-[1.5px] border-marca-500" : "border border-borda"}`}
    >
      <View
        className={`h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${opcao.selecionado ? "border-marca-500" : "border-marca-100"}`}
      >
        {opcao.selecionado ? <View className="h-3 w-3 rounded-full bg-marca-500" /> : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-corpo font-bold text-tinta" numberOfLines={1}>
          {opcao.titulo}
        </Text>
        <Text className="text-rotulo text-tinta-fraco" numberOfLines={1}>
          {opcao.linha}
        </Text>
      </View>
    </Pressable>
  );
}

export function DetalhesAnuncioView({
  data,
  aoMudarData,
  hora,
  aoMudarHora,
  carregandoEnderecos,
  erroEnderecos,
  aoRecarregarEnderecos,
  opcoesEndereco,
  aoEscolherEndereco,
  temAvulso,
  aoUsarOutroEndereco,
  tamanhoLocal,
  aoMudarTamanhoLocal,
  tamanhoLocalMax,
  numeroPessoas,
  aoMudarNumeroPessoas,
  observacoes,
  aoMudarObservacoes,
  erros,
  erroServidor,
  avisoContatos,
  aoConfirmarContatos,
  publicando,
  aoPublicar,
  aoVoltar,
}: DetalhesAnuncioViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoPasso passo={2} total={2} aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-6 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {/* "Não está no futuro" aparece na data: o instante é a data com a hora. */}
          <View className="flex-row items-start gap-4">
            <View className="flex-1">
              <Campo
                rotulo="Data"
                icone={CalendarDays}
                value={data}
                onChangeText={aoMudarData}
                mask={Masks.DATE_DDMMYYYY}
                keyboardType="number-pad"
                placeholder="dd/mm/aaaa"
                erro={erros.data}
              />
            </View>
            <View className="flex-1">
              <Campo
                rotulo="Hora"
                icone={Clock}
                value={hora}
                onChangeText={aoMudarHora}
                mask={MASCARA_HORA}
                keyboardType="number-pad"
                placeholder="hh:mm"
                erro={erros.hora}
              />
            </View>
          </View>

          <View className="gap-2.5" accessibilityRole="radiogroup">
            <Overline>Endereço do serviço</Overline>
            {carregandoEnderecos ? (
              <ActivityIndicator color={CORES_ICONE.marca} />
            ) : erroEnderecos ? (
              <View className="gap-2">
                <Text className="text-rotulo text-tinta-suave">{erroEnderecos}</Text>
                <Botao
                  rotulo="Tentar de novo"
                  variante="contorno"
                  tamanho="padrao"
                  onPress={aoRecarregarEnderecos}
                />
              </View>
            ) : (
              opcoesEndereco.map((opcao) => (
                <CartaoEnderecoOpcao
                  key={opcao.chave}
                  opcao={opcao}
                  aoEscolher={aoEscolherEndereco}
                />
              ))
            )}
            {!carregandoEnderecos && !erroEnderecos && opcoesEndereco.length === 0 ? (
              <Text className="text-rotulo text-tinta-suave">
                Você ainda não tem endereços salvos.
              </Text>
            ) : null}
            <Pressable
              onPress={aoUsarOutroEndereco}
              accessibilityRole="button"
              hitSlop={8}
              className="self-start active:opacity-70"
            >
              <Text className="text-corpo font-bold text-marca-500">
                {temAvulso ? "Editar outro endereço" : "+ Usar outro endereço"}
              </Text>
            </Pressable>
            {erros.endereco ? (
              <Text className="text-rotulo text-perigo">{erros.endereco}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Overline>Detalhes opcionais</Overline>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Campo
                  rotulo="Tamanho do local"
                  value={tamanhoLocal}
                  onChangeText={aoMudarTamanhoLocal}
                  placeholder="Ex.: 72 m²"
                  maxLength={tamanhoLocalMax}
                  erro={erros.tamanhoLocal}
                />
              </View>
              <View className="flex-1">
                <Campo
                  rotulo="Pessoas no local"
                  value={numeroPessoas}
                  onChangeText={aoMudarNumeroPessoas}
                  placeholder="Ex.: 2"
                  keyboardType="number-pad"
                  maxLength={4}
                  erro={erros.numeroPessoas}
                />
              </View>
            </View>
            <CampoContador
              rotulo="Observações"
              dica="opcional"
              estiloRotulo="campo"
              valor={observacoes}
              aoMudar={aoMudarObservacoes}
              placeholder="Ex.: portão azul, interfone 12. Tem escada no local."
              multilinha
              erro={erros.observacoes}
            />
          </View>

          <View className="flex-row gap-3 rounded-card bg-marca-50 p-4">
            <Icone icone={CircleDollarSign} tamanho={18} cor="marca" />
            <View className="flex-1 gap-1">
              <Text className="text-corpo font-bold text-marca-800">Valor não é obrigatório</Text>
              <Text className="text-rotulo text-tinta-suave">
                Você negocia no chat depois que alguém se candidatar. O LIMIO não cobra
                comissão.
              </Text>
            </View>
          </View>

          {avisoContatos ? (
            <View className="gap-3 rounded-card border border-perigo-borda bg-perigo-fundo p-4">
              <View className="flex-row gap-3">
                <Icone icone={ShieldAlert} tamanho={18} cor="perigo" />
                <Text className="flex-1 text-rotulo text-perigo">{avisoContatos}</Text>
              </View>
              <Botao
                rotulo="Confirmar telefone e e-mail"
                variante="destrutivo"
                tamanho="padrao"
                onPress={aoConfirmarContatos}
              />
            </View>
          ) : null}

          {erroServidor ? (
            <Text className="text-rotulo text-perigo">{erroServidor}</Text>
          ) : null}
        </ScrollView>

        <View className="border-t border-borda bg-superficie px-margem py-4">
          <Botao
            rotulo={publicando ? "Publicando..." : "Publicar no mural"}
            onPress={aoPublicar}
            carregando={publicando}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
