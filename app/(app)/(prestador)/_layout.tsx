import { Tabs } from "expo-router";
import { Search, User } from "lucide-react-native";

import { iconeAba, opcoesAbas } from "../../../src/comum/componentes/navegacao/abas";

export default function PrestadorLayout() {
  return (
    <Tabs screenOptions={opcoesAbas}>
      <Tabs.Screen name="index" options={{ title: "Mural", tabBarIcon: iconeAba(Search) }} />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", headerShown: false, tabBarIcon: iconeAba(User) }}
      />
      {/* Ainda sem tela: fora da tab bar até os cards delas chegarem. */}
      <Tabs.Screen name="aplicacoes" options={{ href: null }} />
      <Tabs.Screen name="cota" options={{ href: null }} />
    </Tabs>
  );
}
