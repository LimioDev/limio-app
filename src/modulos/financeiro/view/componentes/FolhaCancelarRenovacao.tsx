import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";

interface FolhaCancelarRenovacaoProps {
  visivel: boolean;
  /** "30/09": fim do período pago. */
  ateQuando: string;
  cancelando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoManter: () => void;
}

/**
 * Confirmação do "Cancelar renovação" da tela 35. Modal próprio porque
 * `Alert` não abre no navegador.
 */
export function FolhaCancelarRenovacao({
  visivel,
  ateQuando,
  cancelando,
  erro,
  aoConfirmar,
  aoManter,
}: FolhaCancelarRenovacaoProps) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={aoManter}
      statusBarTranslucent
    >
      <Pressable
        onPress={aoManter}
        accessibilityLabel="Fechar"
        className="flex-1 justify-end bg-marca-900/50"
      >
        {/* Toque dentro da folha não fecha. */}
        <Pressable onPress={() => {}} className="rounded-t-sheet bg-superficie">
          {/* Padding numa View interna: o SafeAreaView sobrescreve o padding da className. */}
          <SafeAreaView edges={["bottom"]}>
            <View className="gap-4 px-margem pb-2 pt-3">
              <View className="h-1 w-10 self-center rounded-full bg-borda-campo" />
              <View className="gap-1">
                <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                  Cancelar a renovação?
                </Text>
                <Text className="text-rotulo text-tinta-suave">
                  Seu plano continuará ativo até {ateQuando}. Após essa data, sua conta voltará
                  ao limite gratuito de 4 serviços por mês.
                </Text>
              </View>

              {erro ? (
                <Text className="text-rotulo text-perigo" accessibilityLiveRegion="polite">
                  {erro}
                </Text>
              ) : null}

              <View className="gap-1 pt-2">
                <Botao
                  rotulo="Cancelar renovação"
                  variante="destrutivo"
                  carregando={cancelando}
                  onPress={aoConfirmar}
                />
                <Pressable
                  onPress={aoManter}
                  disabled={cancelando}
                  accessibilityRole="button"
                  className={`h-botao items-center justify-center active:opacity-70 ${cancelando ? "opacity-50" : ""}`}
                >
                  <Text className="text-corpo font-semibold text-tinta-suave">Manter o GOLD</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
