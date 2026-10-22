import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, KeyRound, LinkIcon } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { NovaSenhaForm } from "../tipos/auth.types";
import { AvisoInfo } from "./componentes/AvisoInfo";
import { BotaoMostrarSenha } from "../../../comum/componentes/ui/BotaoMostrarSenha";
import {
  RequisitosSenha,
  type RequisitosSenhaAtendidos,
} from "./componentes/RequisitosSenha";

interface NovaSenhaViewProps {
  linkInvalido: boolean;
  control: Control<NovaSenhaForm>;
  erros: FieldErrors<NovaSenhaForm>;
  requisitos: RequisitosSenhaAtendidos;
  podeSalvar: boolean;
  salvando: boolean;
  aoSalvar: () => void;
  erroServidor: string | null;
  aoPedirNovoLink: () => void;
  aoVoltarParaLogin: () => void;
}

export function NovaSenhaView({
  linkInvalido,
  control,
  erros,
  requisitos,
  podeSalvar,
  salvando,
  aoSalvar,
  erroServidor,
  aoPedirNovoLink,
  aoVoltarParaLogin,
}: NovaSenhaViewProps) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="px-margem pt-2">
        <Pressable
          onPress={aoVoltarParaLogin}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o login"
          className="h-toque w-8 items-center justify-center"
        >
          <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-margem"
        contentContainerClassName="gap-5 pb-6 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="h-12 w-12 items-center justify-center rounded-card bg-marca-50">
          <Icone icone={KeyRound} tamanho={20} cor="marca" />
        </View>

        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">Nova senha</Text>
          <Text className="text-corpo text-tinta-suave">
            {linkInvalido
              ? "Este link de recuperação expirou ou já foi usado."
              : "Crie uma senha nova. Depois de salvar, você entra de novo em todos os aparelhos."}
          </Text>
        </View>

        {linkInvalido ? (
          <>
            <AvisoInfo icone={LinkIcon}>
              Cada link vale por 1 hora e só pode ser usado uma vez. Peça um
              novo para continuar.
            </AvisoInfo>
            <Botao rotulo="Pedir novo link" onPress={aoPedirNovoLink} />
          </>
        ) : (
          <>
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
                  secureTextEntry={!mostrar}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  acaoDireita={
                    <BotaoMostrarSenha
                      visivel={mostrar}
                      aoAlternar={() => setMostrar((v) => !v)}
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
                  secureTextEntry={!mostrar}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  onSubmitEditing={podeSalvar ? aoSalvar : undefined}
                />
              )}
            />

            <RequisitosSenha requisitos={requisitos} />

            {erroServidor ? (
              <Text className="text-rotulo text-perigo">{erroServidor}</Text>
            ) : null}

            <Botao
              rotulo="Salvar nova senha"
              onPress={aoSalvar}
              disabled={!podeSalvar}
              carregando={salvando}
            />
          </>
        )}

        <Text
          className="py-2 text-center text-rotulo font-semibold text-marca-500"
          onPress={aoVoltarParaLogin}
        >
          Voltar para o login
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
