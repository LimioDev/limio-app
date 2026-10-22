import type { LucideIcon } from "lucide-react-native";
import {
  Check,
  ChevronLeft,
  FileText,
  LayoutGrid,
  Lock,
  RefreshCw,
  TriangleAlert,
  User,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Icone } from "../../../comum/componentes/ui/Icone";

/** O que acontece ao encerrar (regras do ETI-36), na ordem da tela 12. */
const CONSEQUENCIAS: readonly { icone: LucideIcon; texto: string }[] = [
  {
    icone: User,
    texto: "Nome, foto, e-mail, telefone e endereços são anonimizados.",
  },
  {
    icone: LayoutGrid,
    texto: "Anúncios e candidaturas abertos são encerrados na hora.",
  },
  {
    icone: RefreshCw,
    texto: "Propostas de reagendamento pendentes perdem o efeito.",
  },
  {
    icone: FileText,
    texto:
      "Os registros de auditoria ficam guardados por 5 anos, sem identificar você.",
  },
  {
    icone: Lock,
    texto: "Seu CPF não pode abrir outra conta pelos próximos 12 meses.",
  },
];

interface EncerrarContaViewProps {
  confirmado: boolean;
  aoAlternarConfirmacao: () => void;
  podeEncerrar: boolean;
  encerrando: boolean;
  aoEncerrar: () => void;
  erroServidor: string | null;
  aoVoltar: () => void;
}

export function EncerrarContaView({
  confirmado,
  aoAlternarConfirmacao,
  podeEncerrar,
  encerrando,
  aoEncerrar,
  erroServidor,
  aoVoltar,
}: EncerrarContaViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <View className="flex-row items-center gap-1 px-margem pt-2">
        <Pressable
          onPress={aoVoltar}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-toque w-8 items-center justify-center"
        >
          <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
        </Pressable>
        <Text className="text-secao font-semibold text-tinta">
          Encerrar conta
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-margem"
        contentContainerClassName="gap-5 pb-6 pt-6"
      >
        <View className="h-14 w-14 items-center justify-center rounded-card bg-perigo-fundo">
          <Icone icone={TriangleAlert} tamanho={22} cor="perigo" />
        </View>

        <View className="gap-2">
          <Text className="text-titulo font-bold text-tinta">
            Isso não tem volta
          </Text>
          <Text className="text-corpo text-tinta-suave">
            Ao confirmar, seus dados pessoais são anonimizados e a conta deixa
            de existir.
          </Text>
        </View>

        <View className="gap-4">
          {CONSEQUENCIAS.map(({ icone, texto }) => (
            <View key={texto} className="flex-row items-start gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-perigo-fundo">
                <Icone icone={icone} tamanho={14} cor="perigo" />
              </View>
              <Text className="flex-1 text-corpo text-tinta-suave">{texto}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={aoAlternarConfirmacao}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmado }}
          className="flex-row items-center gap-3 active:opacity-80"
        >
          <View
            className={`h-[22px] w-[22px] items-center justify-center rounded-[7px] ${confirmado ? "bg-marca-500" : "border-[1.5px] border-borda-campo bg-superficie"}`}
          >
            {confirmado ? (
              <Icone icone={Check} tamanho={14} cor="branco" />
            ) : null}
          </View>
          <Text className="flex-1 text-corpo text-tinta">
            Entendi que a exclusão é irreversível.
          </Text>
        </Pressable>

        {erroServidor ? (
          <Text className="text-rotulo text-perigo">{erroServidor}</Text>
        ) : null}
      </ScrollView>

      <View className="gap-1 px-margem pb-2 pt-4">
        <Botao
          rotulo="Encerrar minha conta"
          variante="destrutivo"
          onPress={aoEncerrar}
          disabled={!podeEncerrar}
          carregando={encerrando}
        />
        <Pressable
          onPress={aoVoltar}
          disabled={encerrando}
          accessibilityRole="button"
          className="h-toque items-center justify-center active:opacity-70"
        >
          <Text className="text-corpo font-semibold text-tinta-suave">
            Voltar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
