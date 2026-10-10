import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Lock, Mail } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { LoginForm } from "../tipos/auth.types";
import { AvisoInfo } from "./componentes/AvisoInfo";

interface LoginViewProps {
  control: Control<LoginForm>;
  erros: FieldErrors<LoginForm>;
  aoEntrar: () => void;
  carregando: boolean;
  erroServidor: string | null;
  avisoSaida: string | null;
  aoEsquecerSenha: () => void;
  aoCriarConta: () => void;
  aoVoltar: () => void;
}

export function LoginView({
  control,
  erros,
  aoEntrar,
  carregando,
  erroServidor,
  avisoSaida,
  aoEsquecerSenha,
  aoCriarConta,
  aoVoltar,
}: LoginViewProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-row items-center gap-1 px-margem pt-2">
        <Pressable
          onPress={aoVoltar}
          hitSlop={12}
          className="h-toque w-8 items-center justify-center"
        >
          <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
        </Pressable>
        <Text className="text-secao font-semibold text-tinta">Entrar</Text>
      </View>

      <ScrollView
        className="flex-1 px-margem"
        contentContainerClassName="gap-4 pb-6 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">
            Bem-vindo de volta
          </Text>
          <Text className="text-corpo text-tinta-suave">
            Entre com o e-mail e a senha da sua conta.
          </Text>
        </View>

        {avisoSaida ? <AvisoInfo icone={Lock}>{avisoSaida}</AvisoInfo> : null}

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
              autoComplete="email"
              textContentType="emailAddress"
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
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={aoEntrar}
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

        <Text
          className="self-end text-rotulo font-semibold text-marca-500"
          onPress={aoEsquecerSenha}
        >
          Esqueci minha senha
        </Text>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </ScrollView>

      <View className="gap-3 border-t border-borda px-margem py-4">
        <Botao
          rotulo={carregando ? "Entrando..." : "Entrar"}
          onPress={aoEntrar}
          disabled={carregando}
        />
        <Text className="text-center text-rotulo text-tinta-suave">
          Não tem conta?{" "}
          <Text className="font-semibold text-marca-500" onPress={aoCriarConta}>
            Criar uma conta
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
