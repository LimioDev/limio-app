import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type {
  CancelamentoServicoExibido,
  ErroCancelamentoServico,
} from "../../viewmodel/useServicoCombinadoViewModel";

interface FolhaCancelarServicoProps {
  visivel: boolean;
  cancelamento: CancelamentoServicoExibido | null;
  cancelando: boolean;
  erro: ErroCancelamentoServico | null;
  aoConfirmar: () => void;
  aoManter: () => void;
  /** Tela 46 "Abrir denúncia" (ETI-115). Sem função, o atalho não aparece. */
  aoAbrirDenuncia?: () => void;
}

/**
 * Tela 26 "Cancelar o serviço combinado com (nome)?", folha de baixo sobre a
 * tela 25. Modal próprio porque `Alert` não abre no navegador.
 */
export function FolhaCancelarServico({
  visivel,
  cancelamento,
  cancelando,
  erro,
  aoConfirmar,
  aoManter,
  aoAbrirDenuncia,
}: FolhaCancelarServicoProps) {
  // Com a chamada em andamento a folha não fecha: o resultado decide o próximo passo.
  const aoFechar = () => {
    if (!cancelando) {
      aoManter();
    }
  };

  const bloqueado = erro?.bloqueado === true;

  return (
    <Modal
      visible={visivel && cancelamento !== null}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <Pressable
        onPress={aoFechar}
        accessibilityLabel="Fechar"
        className="flex-1 justify-end bg-marca-900/50"
      >
        {/* Toque dentro da folha não fecha. */}
        <Pressable onPress={() => {}} className="rounded-t-sheet bg-superficie">
          {/* Padding numa View interna: o SafeAreaView sobrescreve o padding da className. */}
          <SafeAreaView edges={["bottom"]}>
            <View className="gap-4 px-margem pb-2 pt-3">
              <View className="h-1 w-10 self-center rounded-full bg-borda-campo" />
              <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                {cancelamento?.titulo}
              </Text>

              {/* Recusado de vez, o "ainda está no prazo" deixa de valer. */}
              {bloqueado ? null : (
                <View className="flex-row gap-3 rounded-card bg-sucesso-fundo p-4">
                  <Icone icone={CircleCheck} tamanho={18} cor="sucesso" />
                  <View className="flex-1 gap-0.5">
                    <Text className="text-rotulo font-bold text-sucesso">
                      Você ainda está no prazo
                    </Text>
                    <Text className="text-rotulo text-sucesso">{cancelamento?.prazo}</Text>
                  </View>
                </View>
              )}

              <View className="flex-row gap-3 rounded-card bg-alerta-fundo p-4">
                <Icone icone={TriangleAlert} tamanho={18} cor="alerta" />
                <Text className="flex-1 text-rotulo text-alerta">{cancelamento?.aviso}</Text>
              </View>

              {erro ? (
                <View
                  className="gap-3 rounded-card bg-perigo-fundo p-4"
                  accessibilityLiveRegion="polite"
                >
                  <View className="flex-row gap-3">
                    <Icone icone={CircleAlert} tamanho={18} cor="perigo" />
                    <Text className="flex-1 text-rotulo text-perigo">{erro.mensagem}</Text>
                  </View>
                  {erro.sugereDenuncia && aoAbrirDenuncia ? (
                    <Botao
                      rotulo="Abrir denúncia"
                      variante="destrutivo"
                      tamanho="padrao"
                      onPress={aoAbrirDenuncia}
                    />
                  ) : null}
                </View>
              ) : null}

              <View className="gap-1 pt-4">
                {bloqueado ? null : (
                  <Botao
                    rotulo="Cancelar serviço"
                    variante="destrutivo"
                    carregando={cancelando}
                    onPress={aoConfirmar}
                  />
                )}
                <Pressable
                  onPress={aoManter}
                  disabled={cancelando}
                  accessibilityRole="button"
                  className={`h-botao items-center justify-center active:opacity-70 ${cancelando ? "opacity-50" : ""}`}
                >
                  <Text className="text-corpo font-semibold text-tinta-suave">
                    Manter combinado
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
