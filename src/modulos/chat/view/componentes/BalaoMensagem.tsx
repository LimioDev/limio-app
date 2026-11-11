import { Check, CheckCheck, CircleAlert, Clock } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";
import { SituacaoMensagem } from "../../tipos/chat.enums";

interface BalaoMensagemProps {
  texto: string;
  hora: string;
  minha: boolean;
  situacao: SituacaoMensagem | null;
  /** Tela 22: balões apagados. */
  somenteLeitura: boolean;
  /** Só nas que não foram enviadas. */
  aoTentarDeNovo?: () => void;
}

/** Checks do balão: ✓ enviada, ✓✓ apagado entregue, ✓✓ cheio lida. */
function IconeSituacao({ situacao }: { situacao: SituacaoMensagem }) {
  switch (situacao) {
    case SituacaoMensagem.ENVIANDO:
      return (
        <View className="opacity-70" accessibilityLabel="Enviando">
          <Icone icone={Clock} tamanho={13} cor="branco" />
        </View>
      );
    case SituacaoMensagem.ENVIADA:
      return (
        <View className="opacity-70" accessibilityLabel="Enviada">
          <Icone icone={Check} tamanho={14} cor="branco" />
        </View>
      );
    case SituacaoMensagem.ENTREGUE:
      return (
        <View className="opacity-70" accessibilityLabel="Entregue">
          <Icone icone={CheckCheck} tamanho={14} cor="branco" />
        </View>
      );
    case SituacaoMensagem.LIDA:
      return (
        <View accessibilityLabel="Lida">
          <Icone icone={CheckCheck} tamanho={14} cor="branco" />
        </View>
      );
    case SituacaoMensagem.NAO_ENVIADA:
      return null;
  }
}

export function BalaoMensagem({
  texto,
  hora,
  minha,
  situacao,
  somenteLeitura,
  aoTentarDeNovo,
}: BalaoMensagemProps) {
  const naoEnviada = situacao === SituacaoMensagem.NAO_ENVIADA;

  let fundo: string;
  if (minha) {
    fundo = somenteLeitura || naoEnviada ? "bg-marca-300" : "bg-marca-500";
  } else {
    fundo = "border border-borda bg-superficie";
  }

  return (
    <View className={`max-w-[80%] gap-1 ${minha ? "self-end items-end" : "self-start"}`}>
      <View className={`rounded-card px-4 pb-2 pt-2.5 ${fundo}`}>
        <Text
          className={`text-corpo ${minha ? "text-white" : somenteLeitura ? "text-tinta-suave" : "text-tinta"}`}
          selectable
        >
          {texto}
        </Text>
        <View className="mt-0.5 flex-row items-center justify-end gap-1">
          <Text className={`text-micro ${minha ? "text-white/80" : "text-tinta-fraco"}`}>
            {hora}
          </Text>
          {minha && situacao ? <IconeSituacao situacao={situacao} /> : null}
        </View>
      </View>

      {naoEnviada ? (
        <Pressable
          onPress={aoTentarDeNovo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Não enviado. Tentar de novo"
          className="flex-row items-center gap-1"
        >
          <Icone icone={CircleAlert} tamanho={14} cor="perigo" />
          <Text className="text-micro font-semibold text-perigo">
            Não enviado · Tentar de novo
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
