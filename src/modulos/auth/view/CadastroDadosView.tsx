import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { DadosPessoaisForm } from "../tipos/auth.types";
import { PassoCadastro } from "./componentes/PassoCadastro";

interface CadastroDadosViewProps {
  control: Control<DadosPessoaisForm>;
  erros: FieldErrors<DadosPessoaisForm>;
  aoContinuar: () => void;
  carregando: boolean;
  erroServidor: string | null;
  aoVoltar: () => void;
}

function IconeCampo({ glifo }: { glifo: string }) {
  return <Text className="text-corpo text-tinta-fraco">{glifo}</Text>;
}

export function CadastroDadosView({
  control,
  erros,
  aoContinuar,
  carregando,
  erroServidor,
  aoVoltar,
}: CadastroDadosViewProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="px-6 pt-2">
        <PassoCadastro titulo="Criar conta" passoAtual={1} aoVoltar={aoVoltar} />
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="gap-4 pb-6 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">Seus dados</Text>
          <Text className="text-corpo text-tinta-suave">
            Uma conta só, por CPF e e-mail. O papel você escolhe depois.
          </Text>
        </View>

        <Controller
          control={control}
          name="nomeCompleto"
          render={({ field }) => (
            <Campo
              rotulo="Nome completo"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.nomeCompleto?.message}
              autoCapitalize="words"
            />
          )}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <Campo
                  rotulo="CPF"
                  value={field.value}
                  onChangeText={field.onChange}
                  erro={erros.cpf?.message}
                  mask={Masks.BRL_CPF}
                  keyboardType="number-pad"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="nascimento"
              render={({ field }) => (
                <Campo
                  rotulo="Nascimento"
                  value={field.value}
                  onChangeText={field.onChange}
                  erro={erros.nascimento?.message}
                  mask={Masks.DATE_DDMMYYYY}
                  keyboardType="number-pad"
                  placeholder="DD/MM/AAAA"
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="cidadeUf"
          render={({ field }) => (
            <Campo
              rotulo="Cidade e UF"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.cidadeUf?.message}
              icone={<IconeCampo glifo="📍" />}
              placeholder="São Paulo · SP"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Campo
              rotulo="E-mail"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.email?.message}
              icone={<IconeCampo glifo="✉️" />}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="celular"
          render={({ field }) => (
            <Campo
              rotulo="Celular"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.celular?.message}
              icone={<IconeCampo glifo="📱" />}
              mask={Masks.BRL_PHONE}
              keyboardType="number-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field }) => (
            <Campo
              rotulo="Senha"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.senha?.message}
              icone={<IconeCampo glifo="🔒" />}
              secureTextEntry={!mostrarSenha}
              acaoDireita={
                <Text
                  className="text-rotulo font-semibold text-marca-500"
                  onPress={() => setMostrarSenha((v) => !v)}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </Text>
              }
            />
          )}
        />

        <Text className="text-micro text-tinta-fraco">
          Você precisa ter 18 anos ou mais para criar uma conta.
        </Text>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </ScrollView>

      <View className="border-t border-borda px-6 py-4">
        <Botao
          rotulo={carregando ? "Enviando..." : "Continuar"}
          onPress={aoContinuar}
          disabled={carregando}
        />
      </View>
    </SafeAreaView>
  );
}
