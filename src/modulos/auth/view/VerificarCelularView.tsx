import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { AvisoInfo } from "./componentes/AvisoInfo";
import { CodigoOtpInput } from "./componentes/CodigoOtpInput";
import { PassoCadastro } from "./componentes/PassoCadastro";

interface VerificarCelularViewProps {
  celular: string | null;
  codigo: string;
  aoAlterarCodigo: (valor: string) => void;
  codigoCompleto: boolean;
  podeReenviar: boolean;
  cooldownFormatado: string;
  aoReenviar: () => void;
  aoTrocarNumero: () => void;
  aoConfirmar: () => void;
  aoVoltar: () => void;
}

export function VerificarCelularView({
  celular,
  codigo,
  aoAlterarCodigo,
  codigoCompleto,
  podeReenviar,
  cooldownFormatado,
  aoReenviar,
  aoTrocarNumero,
  aoConfirmar,
  aoVoltar,
}: VerificarCelularViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-1 gap-5 px-6 pt-2">
        <PassoCadastro passoAtual={2} aoVoltar={aoVoltar} />

        <View className="gap-1">
          <Text className="text-titulo font-bold text-tinta">
            Confirme seu celular
          </Text>
          <Text className="text-corpo text-tinta-suave">
            Enviamos um código de 6 dígitos por SMS para {celular ?? "seu celular"}.
          </Text>
        </View>

        <CodigoOtpInput valor={codigo} aoAlterar={aoAlterarCodigo} />

        <View className="flex-row items-center justify-between">
          {podeReenviar ? (
            <Text
              className="text-rotulo font-semibold text-marca-500"
              onPress={aoReenviar}
            >
              Reenviar código
            </Text>
          ) : (
            <Text className="text-rotulo text-tinta-fraco">
              Reenviar código em {cooldownFormatado}
            </Text>
          )}
          <Text
            className="text-rotulo font-semibold text-marca-500"
            onPress={aoTrocarNumero}
          >
            Trocar número
          </Text>
        </View>

        <AvisoInfo glifo="🛡️">
          Sem o telefone confirmado você não consegue publicar um anúncio nem
          se candidatar.
        </AvisoInfo>
      </View>

      <View className="border-t border-borda px-6 py-4">
        <Botao
          rotulo="Confirmar"
          onPress={aoConfirmar}
          disabled={!codigoCompleto}
        />
      </View>
    </SafeAreaView>
  );
}
