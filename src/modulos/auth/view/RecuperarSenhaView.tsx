import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Lock, Mail, MailCheck } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import type { RecuperarSenhaForm } from "../tipos/auth.types";
import { AvisoInfo } from "./componentes/AvisoInfo";

interface RecuperarSenhaViewProps {
  control: Control<RecuperarSenhaForm>;
  erros: FieldErrors<RecuperarSenhaForm>;
  aoEnviarLink: () => void;
  carregando: boolean;
  confirmacao: string | null;
  erroServidor: string | null;
  aoVoltarParaLogin: () => void;
}

export function RecuperarSenhaView({
  control,
  erros,
  aoEnviarLink,
  carregando,
  confirmacao,
  erroServidor,
  aoVoltarParaLogin,
}: RecuperarSenhaViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="px-margem pt-2">
        <Pressable
          onPress={aoVoltarParaLogin}
          hitSlop={12}
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
          <Icone icone={Lock} tamanho={20} cor="marca" />
        </View>

        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">
            Redefinir sua senha
          </Text>
          <Text className="text-corpo text-tinta-suave">
            Informe o e-mail da conta. Enviamos um link de uso único, válido por
            1 hora.
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Campo
              rotulo="E-mail cadastrado"
              placeholder="voce@email.com"
              value={field.value}
              onChangeText={field.onChange}
              erro={erros.email?.message}
              icone={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              onSubmitEditing={aoEnviarLink}
            />
          )}
        />

        {confirmacao ? (
          <AvisoInfo icone={MailCheck}>{confirmacao}</AvisoInfo>
        ) : null}

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}

        <Botao
          rotulo="Enviar link"
          onPress={aoEnviarLink}
          carregando={carregando}
        />

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
