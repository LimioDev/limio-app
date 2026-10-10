import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { ChevronDown } from "lucide-react-native";

import { Icone } from "../ui/Icone";
import { useSessao } from "../../store/sessao";
import { rotuloPapel } from "../../tipos/papel";

/**
 * Chip do topo dos dashboards (Empregador e Mural do Prestador) que abre o
 * seletor de papel (tela 07). Em `comum/` porque os dois dashboards são de
 * módulos diferentes.
 */
export function SeletorPapelAtivo() {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);

  if (!papelAtivo) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push("/(app)/trocar-papel")}
      hitSlop={8}
      className="flex-row items-center gap-1 self-start rounded-full border border-borda px-3 py-1"
    >
      <Text className="text-rotulo font-semibold text-tinta">
        {rotuloPapel(papelAtivo)}
      </Text>
      <Icone icone={ChevronDown} tamanho={16} />
    </Pressable>
  );
}
