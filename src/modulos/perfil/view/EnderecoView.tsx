import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Interruptor } from "../../../comum/componentes/ui/Interruptor";
import {
  APELIDO_MAX,
  BAIRRO_MAX,
  COMPLEMENTO_MAX,
  NUMERO_MAX,
  RUA_MAX,
  type EnderecoFormEntrada,
} from "../tipos/endereco.types";
import { CabecalhoVoltar } from "./componentes/CabecalhoVoltar";
import { CampoSelecao } from "./componentes/CampoSelecao";

interface EnderecoViewProps {
  titulo: string;
  carregando: boolean;
  erroCarregamento: string | null;
  aoTentarDeNovo: () => void;
  control: Control<EnderecoFormEntrada>;
  erros: FieldErrors<EnderecoFormEntrada>;
  /** "São Paulo · SP"; `null` antes de escolher. */
  cidadeUf: string | null;
  aoEscolherCidade: () => void;
  aoSalvar: () => void;
  salvando: boolean;
  erroServidor: string | null;
  aoVoltar: () => void;
}

export function EnderecoView({
  titulo,
  carregando,
  erroCarregamento,
  aoTentarDeNovo,
  control,
  erros,
  cidadeUf,
  aoEscolherCidade,
  aoSalvar,
  salvando,
  erroServidor,
  aoVoltar,
}: EnderecoViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo={titulo} aoVoltar={aoVoltar} />

      {carregando ? (
        <Carregando />
      ) : erroCarregamento ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">
            {erroCarregamento}
          </Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoTentarDeNovo}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1 px-margem"
            contentContainerClassName="gap-4 pb-6 pt-5"
            keyboardShouldPersistTaps="handled"
          >
            <Controller
              control={control}
              name="apelido"
              render={({ field }) => (
                <Campo
                  rotulo="Apelido"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.apelido?.message}
                  placeholder="Casa, Escritório..."
                  autoCapitalize="sentences"
                  maxLength={APELIDO_MAX}
                />
              )}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="cep"
                  render={({ field }) => (
                    <Campo
                      rotulo="CEP"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      erro={erros.cep?.message}
                      mask={Masks.ZIP_CODE}
                      keyboardType="number-pad"
                      placeholder="00000-000"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <CampoSelecao
                  rotulo="Cidade e UF"
                  valor={cidadeUf}
                  placeholder="Escolher"
                  onPress={aoEscolherCidade}
                  erro={erros.cidade?.message ?? erros.uf?.message}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="rua"
              render={({ field }) => (
                <Campo
                  rotulo="Rua"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.rua?.message}
                  autoCapitalize="words"
                  maxLength={RUA_MAX}
                />
              )}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="numero"
                  render={({ field }) => (
                    <Campo
                      rotulo="Número"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      erro={erros.numero?.message}
                      placeholder="123 ou S/N"
                      autoCapitalize="characters"
                      maxLength={NUMERO_MAX}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="complemento"
                  render={({ field }) => (
                    <Campo
                      rotulo="Complemento"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      erro={erros.complemento?.message}
                      placeholder="Opcional"
                      maxLength={COMPLEMENTO_MAX}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="bairro"
              render={({ field }) => (
                <Campo
                  rotulo="Bairro"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.bairro?.message}
                  autoCapitalize="words"
                  maxLength={BAIRRO_MAX}
                />
              )}
            />

            <Controller
              control={control}
              name="isPadrao"
              render={({ field }) => (
                <View className="mt-1 h-[60px] flex-row items-center justify-between rounded-campo border border-borda bg-superficie px-4">
                  <Text className="text-corpo text-tinta">Usar como endereço padrão</Text>
                  <Interruptor
                    ligado={field.value}
                    aoAlternar={field.onChange}
                    rotuloAcessivel="Usar como endereço padrão"
                  />
                </View>
              )}
            />

            <View className="rounded-card bg-marca-50 p-4">
              <Text className="text-rotulo text-tinta-suave">
                No mural aparece só o bairro. O endereço completo é liberado para o
                prestador escolhido, depois da escolha.
              </Text>
            </View>

            {erroServidor ? (
              <Text className="text-rotulo text-perigo">{erroServidor}</Text>
            ) : null}
          </ScrollView>

          <View className="border-t border-borda bg-superficie px-margem py-4">
            <Botao
              rotulo={salvando ? "Salvando..." : "Salvar endereço"}
              onPress={aoSalvar}
              carregando={salvando}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
