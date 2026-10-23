import { Modal, Pressable, Text, View } from "react-native";

import { Botao } from "../../../../comum/componentes/ui/Botao";

interface ModalConfirmacaoProps {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/**
 * Confirmação de ação destrutiva. Modal próprio em vez de `Alert.alert`,
 * que não abre no navegador.
 */
export function ModalConfirmacao({
  visivel,
  titulo,
  mensagem,
  rotuloConfirmar,
  aoConfirmar,
  aoCancelar,
}: ModalConfirmacaoProps) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoCancelar}
      statusBarTranslucent
    >
      <Pressable
        onPress={aoCancelar}
        accessibilityLabel="Fechar"
        className="flex-1 items-center justify-center bg-marca-900/50 px-margem"
      >
        {/* Toque dentro do cartão não fecha. */}
        <Pressable
          onPress={() => {}}
          accessibilityRole="alert"
          className="w-full max-w-[400px] gap-4 rounded-destaque bg-superficie p-5"
        >
          <View className="gap-2">
            <Text className="text-secao font-bold text-tinta">{titulo}</Text>
            <Text className="text-corpo text-tinta-suave">{mensagem}</Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Botao
                rotulo="Cancelar"
                variante="neutro"
                tamanho="padrao"
                onPress={aoCancelar}
              />
            </View>
            <View className="flex-1">
              <Botao
                rotulo={rotuloConfirmar}
                variante="destrutivo"
                tamanho="padrao"
                onPress={aoConfirmar}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
