import { Lock } from "lucide-react-native";
import type { ComponentProps, ReactNode } from "react";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Masks, type MaskArray } from "react-native-mask-input";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { CartaoForm } from "../tipos/gold.types";
import type { CartaoGoldViewModel } from "../viewmodel/useCartaoGoldViewModel";

const MASCARA_VALIDADE: MaskArray = [/\d/, /\d/, "/", /\d/, /\d/];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <Text className="text-overline font-bold uppercase text-tinta-fraco">{titulo}</Text>
      {children}
    </View>
  );
}

/** Tela "Cartão": dados do cartão e do titular para a assinatura GOLD. */
export function CartaoGoldView({
  control,
  erros,
  erroServidor,
  salvando,
  aoSalvar,
  aoVoltar,
}: CartaoGoldViewModel) {
  const campo = (
    nome: keyof CartaoForm,
    props: Omit<ComponentProps<typeof Campo>, "value" | "onChangeText" | "onBlur" | "erro">,
  ) => (
    <Controller
      control={control}
      name={nome}
      render={({ field }) => (
        <Campo
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          erro={erros[nome]?.message}
          editable={!salvando}
          {...props}
        />
      )}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Cartão da assinatura" aoVoltar={aoVoltar} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-6 pb-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Secao titulo="Dados do cartão">
            {campo("nomeTitular", {
              rotulo: "Nome impresso no cartão",
              autoCapitalize: "characters",
              autoComplete: "cc-name",
            })}
            {campo("numero", {
              rotulo: "Número do cartão",
              mask: Masks.CREDIT_CARD,
              keyboardType: "number-pad",
              autoComplete: "cc-number",
            })}
            <View className="flex-row gap-3">
              <View className="flex-1">
                {campo("validade", {
                  rotulo: "Validade",
                  mask: MASCARA_VALIDADE,
                  keyboardType: "number-pad",
                  placeholder: "MM/AA",
                  autoComplete: "cc-exp",
                })}
              </View>
              <View className="flex-1">
                {campo("cvv", {
                  rotulo: "CVV",
                  keyboardType: "number-pad",
                  maxLength: 4,
                  secureTextEntry: true,
                  autoComplete: "cc-csc",
                })}
              </View>
            </View>
          </Secao>

          <Secao titulo="Titular do cartão">
            {campo("cpf", {
              rotulo: "CPF",
              mask: Masks.BRL_CPF,
              keyboardType: "number-pad",
            })}
            {campo("email", {
              rotulo: "E-mail",
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoComplete: "email",
            })}
            {campo("telefone", {
              rotulo: "Telefone",
              mask: Masks.BRL_PHONE,
              keyboardType: "number-pad",
              placeholder: "(11) 98254-4472",
            })}
            <View className="flex-row gap-3">
              <View className="flex-[2]">
                {campo("cep", {
                  rotulo: "CEP",
                  mask: Masks.ZIP_CODE,
                  keyboardType: "number-pad",
                  autoComplete: "postal-code",
                })}
              </View>
              <View className="flex-1">
                {campo("numeroEndereco", { rotulo: "Número" })}
              </View>
            </View>
          </Secao>

          <View className="flex-row gap-3 rounded-card bg-marca-50 p-4">
            <Icone icone={Lock} tamanho={16} cor="marca" />
            <Text className="flex-1 text-rotulo text-tinta-suave">
              Os dados vão direto para o processador de pagamento e não ficam salvos no aparelho.
              O cartão só é usado para a assinatura GOLD.
            </Text>
          </View>

          {erroServidor ? (
            <Text className="text-rotulo text-perigo" accessibilityRole="alert">
              {erroServidor}
            </Text>
          ) : null}
        </ScrollView>

        <View className="border-t border-borda bg-superficie px-margem py-3">
          <Botao rotulo="Salvar cartão" onPress={aoSalvar} carregando={salvando} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
