import { ChevronLeft, Eye, User } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AneisDecorativos } from "../../../comum/componentes/ui/AneisDecorativos";
import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { SeletorEstrelas } from "./componentes/SeletorEstrelas";

interface AvaliacaoViewProps {
  carregando: boolean;
  erroCarregamento: string | null;
  aoTentarDeNovo: () => void;
  /** Já avaliado ou fora da janela: a avaliação não abre e a tela só mostra isto. */
  semAvaliacao: string | null;
  /** Primeiro nome da outra parte ("Usuário excluído" inteiro, conta encerrada). */
  nome: string;
  fotoUrl: string | null;
  subtitulo: string;
  nota: number | null;
  rotuloNota: string;
  aoEscolherNota: (nota: number) => void;
  comentario: string;
  aoMudarComentario: (texto: string) => void;
  comentarioMax: number;
  contador: string;
  podeEnviar: boolean;
  enviando: boolean;
  erroEnvio: string | null;
  aoEnviar: () => void;
  aoPular: () => void;
  aoVoltar: () => void;
}

export function AvaliacaoView(props: AvaliacaoViewProps) {
  const { carregando, erroCarregamento, semAvaliacao } = props;

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <Carregando />
      </SafeAreaView>
    );
  }

  const mensagem = semAvaliacao ?? erroCarregamento;
  if (mensagem) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <View className="flex-row items-center px-margem pt-2">
          <Pressable
            onPress={props.aoVoltar}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="h-toque w-8 items-center justify-center"
          >
            <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">{mensagem}</Text>
          {semAvaliacao ? (
            <Botao
              rotulo="Voltar"
              variante="contorno"
              tamanho="padrao"
              onPress={props.aoVoltar}
            />
          ) : (
            <Botao
              rotulo="Tentar de novo"
              variante="contorno"
              tamanho="padrao"
              onPress={props.aoTentarDeNovo}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return <FormularioAvaliacao {...props} />;
}

function FormularioAvaliacao({
  nome,
  fotoUrl,
  subtitulo,
  nota,
  rotuloNota,
  aoEscolherNota,
  comentario,
  aoMudarComentario,
  comentarioMax,
  contador,
  podeEnviar,
  enviando,
  erroEnvio,
  aoEnviar,
  aoPular,
}: AvaliacaoViewProps) {
  return (
    <View className="flex-1 bg-fundo">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="overflow-hidden bg-marca-800 pb-16">
            <AneisDecorativos />
            <SafeAreaView edges={["top"]}>
              <View className="flex-row justify-end px-margem pt-2">
                <Pressable
                  onPress={aoPular}
                  disabled={enviando}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: enviando }}
                  className={`h-toque justify-center ${enviando ? "opacity-40" : ""}`}
                >
                  <Text className="text-corpo font-semibold text-marca-300">Pular</Text>
                </Pressable>
              </View>
              <View className="mt-3 items-center gap-3 px-margem">
                {fotoUrl ? (
                  <Avatar nome={nome} fotoUrl={fotoUrl} tamanho={52} />
                ) : (
                  <View className="h-[52px] w-[52px] items-center justify-center rounded-campo bg-white/95">
                    <Icone icone={User} tamanho={22} cor="marca-escura" />
                  </View>
                )}
                <Text
                  className="text-center text-titulo font-bold text-white"
                  accessibilityRole="header"
                >
                  Como foi com {nome}?
                </Text>
                <Text className="text-center text-rotulo text-white/70">{subtitulo}</Text>
              </View>
            </SafeAreaView>
          </View>

          <View className="-mt-8 gap-5 px-margem">
            <View className="items-center gap-5 rounded-destaque border border-borda bg-superficie px-4 py-8">
              <SeletorEstrelas nota={nota} aoEscolher={aoEscolherNota} />
              <Text
                className={`text-secao font-bold ${nota === null ? "text-tinta-fraco" : "text-tinta"}`}
              >
                {rotuloNota}
              </Text>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-overline font-semibold uppercase text-tinta-fraco">
                  Comentário
                </Text>
                <Text className="text-overline font-semibold text-tinta-fraco">opcional</Text>
              </View>
              <View className="rounded-campo border border-borda-campo bg-superficie px-4 pb-3 pt-3">
                <TextInput
                  className="min-h-[72px] text-corpo text-tinta"
                  value={comentario}
                  onChangeText={aoMudarComentario}
                  maxLength={comentarioMax}
                  multiline
                  textAlignVertical="top"
                  placeholder="Conte como foi o serviço"
                  placeholderTextColor="#7B87A4"
                  selectionColor="#2159CC"
                  accessibilityLabel="Comentário, opcional"
                />
                <Text className="self-end text-micro text-tinta-fraco">{contador}</Text>
              </View>
            </View>

            <View className="flex-row gap-3 rounded-card bg-marca-50 p-4">
              <Icone icone={Eye} tamanho={18} cor="suave" />
              <Text className="flex-1 text-rotulo text-tinta-suave">
                A nota entra na média pública de {nome}. Comentário sem nota não é
                aceito, e pular não gera nota nenhuma.
              </Text>
            </View>

            {erroEnvio ? (
              <Text className="text-rotulo text-perigo">{erroEnvio}</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* O padding fica na View: o do SafeAreaView é sobrescrito pela área segura. */}
        <SafeAreaView edges={["bottom"]}>
          <View className="px-margem pb-2 pt-3">
            <Botao
              rotulo={enviando ? "Enviando..." : "Enviar avaliação"}
              onPress={aoEnviar}
              disabled={!podeEnviar}
              carregando={enviando}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
