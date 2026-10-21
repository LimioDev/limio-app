import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks } from "react-native-mask-input";
import { Lock, Mail, MapPin, Smartphone } from "lucide-react-native";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { DadosPessoaisForm } from "../tipos/auth.types";
import { BotaoMostrarSenha } from "../../../comum/componentes/ui/BotaoMostrarSenha";
import { PassoCadastro } from "./componentes/PassoCadastro";

interface CadastroDadosViewProps {
  control: Control<DadosPessoaisForm>;
  erros: FieldErrors<DadosPessoaisForm>;
  aoContinuar: () => void;
  carregando: boolean;
  erroServidor: string | null;
  aoVoltar: () => void;
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
      <View className="px-margem pt-2">
        <PassoCadastro titulo="Criar conta" passoAtual={1} aoVoltar={aoVoltar} />
      </View>

      <ScrollView
        className="flex-1 px-margem"
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
              icone={MapPin}
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
              icone={Mail}
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
              icone={Smartphone}
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
              icone={Lock}
              secureTextEntry={!mostrarSenha}
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
          Você precisa ter 18 anos ou mais para criar uma conta.
        </Text>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </ScrollView>

      <View className="border-t border-borda px-margem py-4">
        <Botao
          rotulo={carregando ? "Enviando..." : "Continuar"}
          onPress={aoContinuar}
          disabled={carregando}
        />
      </View>
    </SafeAreaView>
  );
}
