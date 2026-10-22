import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PapelUsuario } from "../../../comum/tipos/papel";
import type { PapelAlternavel } from "../tipos/auth.types";
import type { OpcaoPapel } from "../viewmodel/useTrocarPapelViewModel";

interface TrocarPapelViewProps {
  opcoes: OpcaoPapel[];
  aoEscolher: (papel: PapelAlternavel) => void;
  papelEmTroca: PapelAlternavel | null | undefined;
  erroServidor: string | null;
  aoFechar: () => void;
  /**
   * Situação do perfil de atuação, vinda do módulo `perfil` pela rota (o `auth`
   * não importa o `perfil`, por isso o tipo é repetido aqui):
   * - `verificando`: card de Prestador travado até a API responder;
   * - `incompleto`: selo "Perfil incompleto", e tocar leva a completar o perfil;
   * - `desconhecido`: a consulta falhou; troca liberada, com o atalho pra completar;
   * - `completo` (ou ausente): troca normal.
   */
  situacaoPerfilPrestador?: "verificando" | "incompleto" | "desconhecido" | "completo";
  aoCompletarPerfilAtuacao?: () => void;
}

export function TrocarPapelView({
  opcoes,
  aoEscolher,
  papelEmTroca,
  erroServidor,
  aoFechar,
  situacaoPerfilPrestador = "completo",
  aoCompletarPerfilAtuacao,
}: TrocarPapelViewProps) {
  const trocando = Boolean(papelEmTroca);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-1 gap-5 px-margem pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-titulo font-bold text-tinta">
            Usar o LIMIO como
          </Text>
          <Text
            className="text-rotulo font-semibold text-marca-500"
            onPress={aoFechar}
          >
            Fechar
          </Text>
        </View>

        <Text className="text-corpo text-tinta-suave">
          Uma conta só para os dois papéis. Você pode trocar quando quiser.
        </Text>

        <View className="gap-3">
          {opcoes.map((opcao) => {
            const situacao =
              opcao.papel === PapelUsuario.PRESTADOR && aoCompletarPerfilAtuacao
                ? situacaoPerfilPrestador
                : "completo";
            const incompleto = situacao === "incompleto";
            const mostrarAtalho = incompleto || situacao === "desconhecido";
            // Toque rápido não troca de papel antes de saber se o perfil está completo.
            const verificando = situacao === "verificando" && !opcao.ativo;
            // Prestador incompleto: tocar leva a completar o perfil, não troca.
            const aoTocar =
              incompleto && !opcao.ativo
                ? aoCompletarPerfilAtuacao!
                : () => aoEscolher(opcao.papel);

            return (
              <Pressable
                key={opcao.papel}
                onPress={aoTocar}
                disabled={trocando || verificando}
                accessibilityState={{ disabled: trocando || verificando, busy: verificando }}
                className={`gap-1 rounded-card border p-4 ${opcao.ativo ? "border-marca-500 bg-marca-50" : "border-borda bg-superficie"} ${(trocando && papelEmTroca !== opcao.papel) || verificando ? "opacity-50" : ""}`}
              >
                {incompleto ? (
                  <View className="mb-1 self-start rounded-full bg-alerta-fundo px-2.5 py-1">
                    <Text className="text-overline font-bold uppercase text-alerta">
                      Perfil incompleto
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row items-center justify-between">
                  <Text className="text-corpo font-bold text-tinta">
                    {opcao.rotulo}
                  </Text>
                  {opcao.ativo ? (
                    <View className="rounded-full bg-marca-500 px-2 py-1">
                      <Text className="text-micro font-medium text-white">
                        Papel ativo
                      </Text>
                    </View>
                  ) : null}
                  {papelEmTroca === opcao.papel || verificando ? (
                    <ActivityIndicator color="#2159CC" />
                  ) : null}
                </View>
                <Text className="text-rotulo text-tinta-suave">
                  {opcao.descricao}
                </Text>
                {mostrarAtalho ? (
                  <Text
                    className="pt-1 text-rotulo font-bold text-marca-500"
                    onPress={aoCompletarPerfilAtuacao}
                    accessibilityRole="link"
                  >
                    Completar perfil de atuação ›
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
