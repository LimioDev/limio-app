import { Tabs } from "expo-router";
import { House, LayoutGrid, MessageSquare, User } from "lucide-react-native";

import { iconeAba, opcoesAbas } from "../../../src/comum/componentes/navegacao/abas";

export default function ContratanteLayout() {
  return (
    <Tabs screenOptions={opcoesAbas}>
      <Tabs.Screen
        name="index"
        options={{ title: "Início", headerShown: false, tabBarIcon: iconeAba(House) }}
      />
      <Tabs.Screen
        name="anuncios"
        options={{ title: "Anúncios", tabBarIcon: iconeAba(LayoutGrid) }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarIcon: iconeAba(MessageSquare) }}
      />
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
