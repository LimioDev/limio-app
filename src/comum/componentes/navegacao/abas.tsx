import type { BottomTabNavigationOptions } from "expo-router/tabs";
import type { LucideIcon } from "lucide-react-native";

import { CORES_ICONE, Icone } from "../ui/Icone";

/** Tab bar dos dashboards (Empregador e Prestador), como no protótipo. */
export const opcoesAbas: BottomTabNavigationOptions = {
  tabBarActiveTintColor: CORES_ICONE.marca,
  tabBarInactiveTintColor: CORES_ICONE.fraco,
  tabBarLabelStyle: { fontSize: 10.5 },
  tabBarStyle: { borderTopColor: "#E3E8F3" },
};

export function iconeAba(
  icone: LucideIcon,
): BottomTabNavigationOptions["tabBarIcon"] {
  return function IconeAba({ focused }) {
    return <Icone icone={icone} tamanho={22} cor={focused ? "marca" : "fraco"} />;
  };
}
