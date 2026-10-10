import { Redirect } from "expo-router";
import { Lock, MapPin, Plus, Zap } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../src/comum/componentes/ui/Avatar";
import { Badge } from "../src/comum/componentes/ui/Badge";
import { Botao } from "../src/comum/componentes/ui/Botao";
import { Campo } from "../src/comum/componentes/ui/Campo";
import { Card } from "../src/comum/componentes/ui/Card";
import { Chip } from "../src/comum/componentes/ui/Chip";
import { Interruptor } from "../src/comum/componentes/ui/Interruptor";
import { Progresso } from "../src/comum/componentes/ui/Progresso";
import { Reputacao } from "../src/comum/componentes/ui/Reputacao";
import type { Estado } from "../src/comum/tipos/api";

const ESTADOS: Estado[] = [
  "aguardando",
  "combinado",
  "andamento",
  "validacao",
  "contestacao",
  "concluido",
  "cancelado",
  "expirado",
];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-overline font-bold uppercase text-tinta-fraco">{titulo}</Text>
      {children}
    </View>
  );
}

/** Vitrine do design system (`comum/componentes/ui`). Só em desenvolvimento. */
export default function Catalogo() {
  const [ligado, setLigado] = useState(true);
  const [chip, setChip] = useState("Elétrica");
  const [texto, setTexto] = useState("");

  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-fundo">
      <ScrollView contentContainerClassName="gap-8 px-margem py-6">
        <Text className="text-titulo font-bold text-tinta">Componentes</Text>

        <Secao titulo="Botões">
          <Botao rotulo="Primário" />
          <Botao rotulo="Escuro" variante="escuro" />
          <Botao rotulo="Contorno" variante="contorno" tamanho="padrao" />
          <Botao rotulo="Neutro" variante="neutro" tamanho="padrao" />
          <Botao rotulo="Destrutivo" variante="destrutivo" tamanho="padrao" />
          <Botao rotulo="Com ícone" icone={Plus} tamanho="padrao" />
          <Botao rotulo="Carregando" carregando tamanho="padrao" />
        </Secao>

        <Secao titulo="Campos">
          <Campo rotulo="Vazio" placeholder="Digite aqui" value={texto} onChangeText={setTexto} />
          <Campo rotulo="Com ícone" icone={MapPin} value="São Paulo" onChangeText={() => {}} />
          <Campo
            rotulo="Com ação"
            icone={Lock}
            value="senha123"
            secureTextEntry
            onChangeText={() => {}}
            acaoDireita={<Text className="text-rotulo font-semibold text-marca-500">Mostrar</Text>}
          />
          <Campo rotulo="Com erro" value="email@" erro="E-mail inválido" onChangeText={() => {}} />
        </Secao>

        <Secao titulo="Chips">
          <View className="flex-row flex-wrap gap-2">
            {["Elétrica", "Limpeza", "12 km"].map((rotulo) => (
              <Chip
                key={rotulo}
                rotulo={rotulo}
                icone={rotulo === "Elétrica" ? Zap : undefined}
                selecionado={chip === rotulo}
                onPress={() => setChip(rotulo)}
              />
            ))}
          </View>
        </Secao>

        <Secao titulo="Controles, avatar, reputação, progresso">
          <View className="flex-row items-center gap-4">
            <Interruptor ligado={ligado} aoAlternar={setLigado} rotuloAcessivel="Exemplo" />
            <Interruptor ligado={false} aoAlternar={() => {}} />
            <Avatar nome="Rafael Souza" />
            <Avatar nome="Marina Barros" />
          </View>
          <Reputacao nota={4.8} totalAvaliacoes={23} />
          <Progresso atual={2} total={4} rotulo="2 de 4 escolhas usadas" />
        </Secao>

        <Secao titulo="Estados do anúncio">
          <View className="flex-row flex-wrap gap-2">
            {ESTADOS.map((estado) => (
              <Badge key={estado} estado={estado} />
            ))}
          </View>
        </Secao>

        <Secao titulo="Card">
          <Card className="gap-1">
            <Text className="text-secao font-semibold text-tinta">Serviço combinado</Text>
            <Text className="text-corpo text-tinta">Preciso instalar 3 tomadas novas na sala.</Text>
            <Text className="text-rotulo text-tinta-suave">Renova em 1º de setembro</Text>
          </Card>
        </Secao>
      </ScrollView>
    </SafeAreaView>
  );
}
