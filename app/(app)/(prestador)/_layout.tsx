import { Tabs } from "expo-router";
import { FileText, MessageSquare, Search, User } from "lucide-react-native";

import { iconeAba, opcoesAbas } from "../../../src/comum/componentes/navegacao/abas";

export default function PrestadorLayout() {
  return (
    <Tabs screenOptions={opcoesAbas}>
      <Tabs.Screen
        name="index"
        options={{ title: "Mural", headerShown: false, tabBarIcon: iconeAba(Search) }}
      />
      <Tabs.Screen
        name="aplicacoes"
        options={{ title: "Aplicações", tabBarIcon: iconeAba(FileText) }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarIcon: iconeAba(MessageSquare) }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", headerShown: false, tabBarIcon: iconeAba(User) }}
      />
      {/* Ainda sem tela: fora da tab bar até o card da cota (ETI-79/ETI-80) chegar. */}
      <Tabs.Screen name="cota" options={{ href: null }} />
    </Tabs>
  );
}
