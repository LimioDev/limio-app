import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { AlterarSenhaForm } from "../tipos/auth.types";
import { BotaoMostrarSenha } from "./componentes/BotaoMostrarSenha";
import {
  RequisitosSenha,
  type RequisitosSenhaAtendidos,
} from "./componentes/RequisitosSenha";

interface AlterarSenhaViewProps {
  control: Control<AlterarSenhaForm>;
  erros: FieldErrors<AlterarSenhaForm>;
  requisitos: RequisitosSenhaAtendidos;
  podeSalvar: boolean;
  salvando: boolean;
  aoSalvar: () => void;
  erroServidor: string | null;
  aoVoltar: () => void;
}

export function AlterarSenhaView({
  control,
  erros,
  requisitos,
  podeSalvar,
  salvando,
  aoSalvar,
  erroServidor,
  aoVoltar,
}: AlterarSenhaViewProps) {
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);

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
        <Text className="text-secao font-semibold text-tinta">
          Alterar senha
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-margem"
        contentContainerClassName="gap-4 pb-6 pt-5"
        keyboardShouldPersistTaps="handled"
      >
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
              secureTextEntry={!mostrarAtual}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              acaoDireita={
                <BotaoMostrarSenha
                  visivel={mostrarAtual}
                  aoAlternar={() => setMostrarAtual((v) => !v)}
                />
              }
            />
          )}
        />

        <Controller
          control={control}
          name="novaSenha"
          render={({ field }) => (
            <Campo
              rotulo="Nova senha"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              erro={erros.novaSenha?.message}
              secureTextEntry={!mostrarNova}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              acaoDireita={
                <BotaoMostrarSenha
                  visivel={mostrarNova}
                  aoAlternar={() => setMostrarNova((v) => !v)}
                />
              }
            />
          )}
        />

        <Controller
          control={control}
          name="repetirNovaSenha"
          render={({ field }) => (
            <Campo
              rotulo="Repetir a nova senha"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              erro={erros.repetirNovaSenha?.message}
              secureTextEntry={!mostrarNova}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              onSubmitEditing={podeSalvar ? aoSalvar : undefined}
            />
          )}
        />

        <RequisitosSenha requisitos={requisitos} />

        <Text className="text-rotulo text-tinta-fraco">
          Você continua conectado neste aparelho depois de trocar a senha.
        </Text>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </ScrollView>

      <View className="border-t border-borda px-margem py-4">
        <Botao
          rotulo="Salvar nova senha"
          onPress={aoSalvar}
          disabled={!podeSalvar}
          carregando={salvando}
        />
      </View>
    </SafeAreaView>
  );
}
