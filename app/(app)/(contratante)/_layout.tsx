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
      {/* Criar e ver o anúncio ficam em `(app)/anuncio`, fora das abas. */}
    </Tabs>
  );
}
