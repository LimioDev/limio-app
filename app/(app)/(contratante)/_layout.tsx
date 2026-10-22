import { Tabs } from "expo-router";
import { House, User } from "lucide-react-native";

import { iconeAba, opcoesAbas } from "../../../src/comum/componentes/navegacao/abas";

export default function ContratanteLayout() {
  return (
    <Tabs screenOptions={opcoesAbas}>
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: iconeAba(House) }} />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", headerShown: false, tabBarIcon: iconeAba(User) }}
      />
      {/* Ainda sem tela: fora da tab bar até os cards delas chegarem. */}
      <Tabs.Screen name="novo" options={{ href: null }} />
      <Tabs.Screen name="anuncio/[id]" options={{ href: null }} />
    </Tabs>
  );
}
