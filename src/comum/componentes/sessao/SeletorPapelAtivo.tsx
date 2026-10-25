import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { ChevronDown, LayoutGrid } from "lucide-react-native";

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
      accessibilityRole="button"
      accessibilityLabel={`Papel ativo: ${rotuloPapel(papelAtivo)}. Trocar papel`}
      className="flex-row items-center gap-2 self-start rounded-chip bg-marca-800 py-2 pl-3 pr-2.5 active:opacity-80"
    >
      <Icone icone={LayoutGrid} tamanho={16} cor="branco" />
      <Text className="text-[14px] font-bold text-white">
        {rotuloPapel(papelAtivo)}
      </Text>
      <Icone icone={ChevronDown} tamanho={18} cor="branco" />
    </Pressable>
  );
}
