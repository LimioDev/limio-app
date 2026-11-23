import { CircleAlert, Info } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";
import type {
  CancelamentoServicoPrestadorExibido,
  ErroCancelamentoServicoPrestador,
} from "../../viewmodel/useSeuServicoViewModel";

interface FolhaCancelarServicoPrestadorProps {
  visivel: boolean;
  cancelamento: CancelamentoServicoPrestadorExibido | null;
  cancelando: boolean;
  erro: ErroCancelamentoServicoPrestador | null;
  aoConfirmar: () => void;
  aoManter: () => void;
}

/** Tela 39 "Cancelar este serviço?" — confirmação de cancelamento pelo Prestador (ETI-97). */
export function FolhaCancelarServicoPrestador({
  visivel,
  cancelamento,
  cancelando,
  erro,
  aoConfirmar,
  aoManter,
}: FolhaCancelarServicoPrestadorProps) {
  const aoFechar = () => {
    if (!cancelando) aoManter();
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
                Cancelar este serviço?
              </Text>

              {cancelamento ? (
                <Text className="text-corpo text-tinta-suave">{cancelamento.subtitulo}</Text>
              ) : null}

              <View className="gap-2">
                {cancelamento?.mostrarCota ? (
                  <View className="flex-row gap-3">
                    <Icone icone={Info} tamanho={18} cor="suave" />
                    <Text className="flex-1 text-rotulo text-tinta-suave">
                      Esta candidatura continuará descontada da sua cota mensal (não há devolução da
                      cota).
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row gap-3">
                  <Icone icone={Info} tamanho={18} cor="suave" />
                  <Text className="flex-1 text-rotulo text-tinta-suave">
                    O serviço será encerrado definitivamente e não voltará para o mural de vagas.
                  </Text>
                </View>
                {cancelamento ? (
                  <View className="flex-row gap-3">
                    <Icone icone={Info} tamanho={18} cor="suave" />
                    <Text className="flex-1 text-rotulo text-tinta-suave">
                      {cancelamento.nomeEmpregador} será notificada imediatamente sobre o seu
                      cancelamento.
                    </Text>
                  </View>
                ) : null}
              </View>

              {erro ? (
                <View
                  className="flex-row gap-3 rounded-card bg-perigo-fundo p-4"
                  accessibilityLiveRegion="polite"
                >
                  <Icone icone={CircleAlert} tamanho={18} cor="perigo" />
                  <Text className="flex-1 text-rotulo text-perigo">{erro.mensagem}</Text>
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
                  <Text className="text-corpo font-semibold text-tinta-suave">Manter serviço</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
