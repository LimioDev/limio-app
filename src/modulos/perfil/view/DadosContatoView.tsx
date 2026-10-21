import { useState } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks, type Mask, type MaskArray } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { BotaoMostrarSenha } from "../../../comum/componentes/ui/BotaoMostrarSenha";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { NOME_EXIBICAO_MAX, type DadosContatoForm } from "../tipos/perfil.types";
import { CabecalhoVoltar } from "./componentes/CabecalhoVoltar";

const D = /\d/;
/**
 * Fixo legado (10 dígitos) com uma posição a mais no fim: mostra "(11) 3254-4472"
 * e ainda deixa digitar o 11º dígito, quando a máscara passa pra de celular.
 */
const TELEFONE_ATE_10: MaskArray = ["(", D, D, ")", " ", D, D, D, D, "-", D, D, D, D, D];

/**
 * `Masks.BRL_PHONE` é fixa em DDD + 5 + 4: uma conta antiga com telefone fixo
 * abriria a tela como "(11) 32544-472". Escolhe a máscara pelo total de dígitos.
 */
const mascaraTelefone: Mask = (valor = "") =>
  valor.replace(/\D/g, "").length <= 10 ? TELEFONE_ATE_10 : Masks.BRL_PHONE;

interface DadosContatoViewProps {
  carregando: boolean;
  erroCarregamento: string | null;
  aoTentarDeNovo: () => void;
  control: Control<DadosContatoForm>;
  erros: FieldErrors<DadosContatoForm>;
  /** E-mail ou telefone mudou: a API pede a senha atual. */
  pedeSenha: boolean;
  aoSalvar: () => void;
  salvando: boolean;
  erroServidor: string | null;
  aoVoltar: () => void;
}

export function DadosContatoView({
  carregando,
  erroCarregamento,
  aoTentarDeNovo,
  control,
  erros,
  pedeSenha,
  aoSalvar,
  salvando,
  erroServidor,
  aoVoltar,
}: DadosContatoViewProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Dados de contato" aoVoltar={aoVoltar} />

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
            contentContainerClassName="gap-5 pb-6 pt-5"
            keyboardShouldPersistTaps="handled"
          >
            <Controller
              control={control}
              name="nomeExibicao"
              render={({ field }) => (
                <Campo
                  rotulo="Nome de exibição"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.nomeExibicao?.message}
                  autoCapitalize="words"
                  maxLength={NOME_EXIBICAO_MAX}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Campo
                  rotulo="E-mail de contato"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />

            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Campo
                  rotulo="Telefone"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  erro={erros.telefone?.message}
                  mask={mascaraTelefone}
                  keyboardType="number-pad"
                  placeholder="(11) 98254-4472"
                />
              )}
            />

            {pedeSenha ? (
              <View className="gap-1.5">
                <Controller
                  control={control}
                  name="senhaAtual"
                  render={({ field }) => (
                    <Campo
                      rotulo="Senha atual"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      erro={erros.senhaAtual?.message}
                      secureTextEntry={!mostrarSenha}
                      autoCapitalize="none"
                      autoComplete="current-password"
                      acaoDireita={
                        <BotaoMostrarSenha
                          visivel={mostrarSenha}
                          aoAlternar={() => setMostrarSenha((v) => !v)}
                        />
                      }
                    />
                  )}
                />
                <Text className="text-micro text-tinta-fraco">
                  Para trocar o e-mail ou o telefone, confirme que é você.
                </Text>
              </View>
            ) : null}

            <View className="rounded-card bg-marca-50 p-4">
              <Text className="text-rotulo text-tinta-suave">
                Trocar o e-mail ou o telefone pede uma nova confirmação antes de
                você publicar um anúncio ou se candidatar.
              </Text>
            </View>

            <Text className="text-rotulo text-tinta-fraco">
              É este nome e esta foto que aparecem no mural e no seu perfil
              público.
            </Text>

            {erroServidor ? (
              <Text className="text-rotulo text-perigo">{erroServidor}</Text>
            ) : null}
          </ScrollView>

          <View className="border-t border-borda bg-superficie px-margem py-4">
            <Botao
              rotulo={salvando ? "Salvando..." : "Salvar"}
              onPress={aoSalvar}
              carregando={salvando}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
