import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Masks } from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { CampoSelecao } from "../../../comum/componentes/ui/CampoSelecao";
import {
  BAIRRO_MAX,
  COMPLEMENTO_MAX,
  NUMERO_MAX,
  RUA_MAX,
  type CamposEnderecoFormEntrada,
} from "../../../comum/tipos/endereco";

interface EnderecoAvulsoViewProps {
  control: Control<CamposEnderecoFormEntrada>;
  erros: FieldErrors<CamposEnderecoFormEntrada>;
  /** "São Paulo · SP"; `null` antes de escolher. */
  cidadeUf: string | null;
  aoEscolherCidade: () => void;
  aoUsar: () => void;
  aoVoltar: () => void;
}

export function EnderecoAvulsoView({
  control,
  erros,
  cidadeUf,
  aoEscolherCidade,
  aoUsar,
  aoVoltar,
}: EnderecoAvulsoViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Outro endereço" aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-4 pb-6 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-rotulo text-tinta-suave">
            Vale só para este anúncio. Para guardar o endereço, cadastre em Perfil →
            Endereços salvos.
          </Text>

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

          <View className="rounded-card bg-marca-50 p-4">
            <Text className="text-rotulo text-tinta-suave">
              No mural aparece só o bairro. O endereço completo é liberado para o
              prestador escolhido, depois da escolha.
            </Text>
          </View>
        </ScrollView>

        <View className="border-t border-borda bg-superficie px-margem py-4">
          <Botao rotulo="Usar este endereço" onPress={aoUsar} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
