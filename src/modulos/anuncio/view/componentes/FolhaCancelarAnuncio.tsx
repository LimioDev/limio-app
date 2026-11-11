import type { LucideIcon } from "lucide-react-native";
import { Coins, MessageSquare, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Icone } from "../../../../comum/componentes/ui/Icone";

interface FolhaCancelarAnuncioProps {
  visivel: boolean;
  /** Candidaturas `ENVIADA`, da consulta da tela 16. */
  candidaturasPendentes: number;
  cancelando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoManter: () => void;
}

function Item({ icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={icone} tamanho={14} cor="marca" />
      </View>
      <Text className="flex-1 pt-0.5 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

function textoPendentes(total: number): string {
  return total === 1
    ? "A candidatura pendente é encerrada."
    : `As ${total} candidaturas pendentes são encerradas.`;
}

/**
 * Tela 17 "Cancelar este anúncio?" (17b sem candidatos: só o item da cota).
 * Modal próprio porque `Alert` não abre no navegador.
 */
export function FolhaCancelarAnuncio({
  visivel,
  candidaturasPendentes,
  cancelando,
  erro,
  aoConfirmar,
  aoManter,
}: FolhaCancelarAnuncioProps) {
  // Com a chamada em andamento a folha não fecha: o resultado decide o próximo passo.
  const aoFechar = () => {
    if (!cancelando) {
      aoManter();
    }
  };

  return (
    <Modal
      visible={visivel}
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
              <View className="gap-1">
                <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
                  Cancelar este anúncio?
                </Text>
                <Text className="text-rotulo text-tinta-suave">
                  Ele sai do mural agora e não pode ser reaberto.
                </Text>
              </View>

              <View className="gap-3">
                {candidaturasPendentes > 0 ? (
                  <>
                    <Item icone={X} texto={textoPendentes(candidaturasPendentes)} />
                    <Item
                      icone={MessageSquare}
                      texto="Os chats com os candidatos ficam em somente leitura."
                    />
                  </>
                ) : null}
                <Item
                  icone={Coins}
                  texto="Nenhuma cota é consumida nem devolvida — ninguém foi escolhido."
                />
              </View>

              {erro ? (
                <Text className="text-rotulo text-perigo" accessibilityLiveRegion="polite">
                  {erro}
                </Text>
              ) : null}

              <View className="gap-1 pt-4">
                <Botao
                  rotulo="Cancelar anúncio"
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
                  <Text className="text-corpo font-semibold text-tinta-suave">
                    Manter no mural
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
