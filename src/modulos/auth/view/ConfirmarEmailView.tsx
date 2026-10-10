import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleCheck, Mail, ShieldCheck } from "lucide-react-native";

import { Icone } from "../../../comum/componentes/ui/Icone";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { AvisoInfo } from "./componentes/AvisoInfo";
import { PassoCadastro } from "./componentes/PassoCadastro";

interface ConfirmarEmailViewProps {
  email: string | null;
  rotuloPapelAtivo: string;
  linkReenviado: boolean;
  aoReenviarLink: () => void;
  aoUsarOutroEmail: () => void;
  aoIrParaApp: () => void;
  aoVoltar: () => void;
}

export function ConfirmarEmailView({
  email,
  rotuloPapelAtivo,
  linkReenviado,
  aoReenviarLink,
  aoUsarOutroEmail,
  aoIrParaApp,
  aoVoltar,
}: ConfirmarEmailViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-1 gap-5 px-margem pt-2">
        <PassoCadastro passoAtual={3} aoVoltar={aoVoltar} />

        <View className="h-12 w-12 items-center justify-center rounded-card bg-marca-50">
          <Icone icone={Mail} tamanho={24} cor="marca" />
        </View>

        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">
            Confirme seu e-mail
          </Text>
          <Text className="text-corpo text-tinta-suave">
            Enviamos um link de confirmação para {email ?? "seu e-mail"}.
          </Text>
        </View>

        <AvisoInfo icone={ShieldCheck}>
          Sua conta já existe{"\n"}Você pode entrar agora. Publicar um anúncio
          ou se candidatar a um serviço só libera depois que o e-mail estiver
          confirmado.
        </AvisoInfo>

        <AvisoInfo icone={CircleCheck}>
          O telefone já está verificado. Seu papel inicial é{" "}
          {rotuloPapelAtivo} — dá pra trocar a qualquer momento.
        </AvisoInfo>

        {linkReenviado ? (
          <Text className="text-rotulo text-marca-500">
            Link reenviado — confira sua caixa de entrada.
          </Text>
        ) : null}
      </View>

      <View className="gap-3 border-t border-borda px-margem py-4">
        <Botao
          rotulo="Reenviar link"
          variante="contorno"
          onPress={aoReenviarLink}
        />
        <Botao rotulo="Ir para o app" onPress={aoIrParaApp} />
        <Text
          className="text-center text-rotulo text-tinta-fraco"
          onPress={aoUsarOutroEmail}
        >
          Usar outro e-mail
        </Text>
      </View>
    </SafeAreaView>
  );
}
