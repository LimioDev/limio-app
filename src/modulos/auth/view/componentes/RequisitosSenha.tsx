import { Text, View } from "react-native";
import { Check, Circle } from "lucide-react-native";

import { Icone } from "../../../../comum/componentes/ui/Icone";

export interface RequisitosSenhaAtendidos {
  tamanho: boolean;
  letra: boolean;
  numero: boolean;
}

function Requisito({ atendido, rotulo }: { atendido: boolean; rotulo: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icone
        icone={atendido ? Check : Circle}
        tamanho={atendido ? 16 : 8}
        cor={atendido ? "marca" : "fraco"}
      />
      <Text
        className={`text-rotulo ${atendido ? "text-marca-500" : "text-tinta-suave"}`}
      >
        {rotulo}
      </Text>
    </View>
  );
}

export function RequisitosSenha({
  requisitos,
}: {
  requisitos: RequisitosSenhaAtendidos;
}) {
  return (
    <View className="gap-2 rounded-card bg-marca-50 p-4">
      <Text className="text-rotulo font-semibold text-tinta-suave">
        A nova senha precisa ter:
      </Text>
      <Requisito atendido={requisitos.tamanho} rotulo="8 caracteres" />
      <Requisito atendido={requisitos.letra} rotulo="uma letra" />
      <Requisito atendido={requisitos.numero} rotulo="um número" />
    </View>
  );
}
