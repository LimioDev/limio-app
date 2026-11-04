import { CircleCheck, Lock, Shield } from "lucide-react-native";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { CORES_ICONE, Icone } from "../../../comum/componentes/ui/Icone";
import type { ChatViewModel, ItemConversa } from "../viewmodel/useChatViewModel";
import { BalaoMensagem } from "./componentes/BalaoMensagem";
import { CabecalhoChat } from "./componentes/CabecalhoChat";
import { CampoMensagem, RodapeSomenteLeitura } from "./componentes/CampoMensagem";

/** Telas 21 "Chat" e 22 "Chat somente leitura" (22b a 22e mudam só o aviso). */
export function ChatView({
  cabecalho,
  itens,
  carregando,
  erro,
  podeTentarDeNovo,
  recarregando,
  aoRecarregar,
  aoVoltar,
  mostrarAvisoContato,
  avisoSomenteLeitura,
  carregandoAnteriores,
  aoCarregarAnteriores,
  texto,
  textoMax,
  aoMudarTexto,
  podeEnviar,
  aoEnviar,
  aoTentarDeNovo,
  aoCamera,
  escolher,
  aoEscolher,
  menuAberto,
  aoAbrirMenu,
  aoFecharMenu,
  aoVerPerfil,
  aoDenunciar,
  rotuloLinkSomenteLeitura,
  aoLinkSomenteLeitura,
}: ChatViewModel) {
  const topo = (
    <CabecalhoChat
      cabecalho={cabecalho}
      aoVoltar={aoVoltar}
      menuAberto={menuAberto}
      aoAbrirMenu={aoAbrirMenu}
      aoFecharMenu={aoFecharMenu}
      aoVerPerfil={aoVerPerfil}
      aoDenunciar={aoDenunciar}
    />
  );

  if (!cabecalho || carregando) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-fundo">
        {topo}
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
            <Botao
              rotulo={podeTentarDeNovo ? "Tentar de novo" : "Voltar"}
              variante="contorno"
              tamanho="padrao"
              carregando={podeTentarDeNovo && recarregando}
              onPress={podeTentarDeNovo ? aoRecarregar : aoVoltar}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const somenteLeitura = cabecalho.somenteLeitura;

  function renderizarItem({ item }: { item: ItemConversa }) {
    if (item.tipo === "dia") {
      return (
        <Text className="py-1 text-center text-rotulo font-semibold text-tinta-fraco">
          {item.rotulo}
        </Text>
      );
    }
    const { idLocal } = item;
    return (
      <BalaoMensagem
        texto={item.texto}
        hora={item.hora}
        minha={item.minha}
        situacao={item.situacao}
        somenteLeitura={somenteLeitura}
        aoTentarDeNovo={idLocal ? () => aoTentarDeNovo(idLocal) : undefined}
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-fundo">
      {topo}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        {avisoSomenteLeitura ? (
          <Faixa icone={Shield} texto={avisoSomenteLeitura} somenteLeitura />
        ) : mostrarAvisoContato ? (
          <Faixa
            icone={Lock}
            texto="Telefone, WhatsApp e endereço completo só aparecem depois da escolha."
          />
        ) : null}

        <FlatList
          data={itens}
          inverted
          keyExtractor={(item) => item.chave}
          renderItem={renderizarItem}
          className="flex-1"
          contentContainerClassName="gap-2 px-margem py-3"
          keyboardShouldPersistTaps="handled"
          // Lista invertida: o "fim" é o topo, onde ficam as mais antigas.
          onEndReached={aoCarregarAnteriores}
          onEndReachedThreshold={0.3}
          // Invertida: o header fica embaixo (depois da última) e o footer em cima.
          ListHeaderComponent={somenteLeitura ? <ConversaEncerrada /> : null}
          ListFooterComponent={
            carregandoAnteriores ? <ActivityIndicator color={CORES_ICONE.marca} /> : null
          }
        />

        {escolher ? (
          <View className="px-margem pb-3">
            <Botao
              rotulo={escolher.rotulo}
              variante="escuro"
              tamanho="padrao"
              icone={CircleCheck}
              onPress={aoEscolher}
            />
          </View>
        ) : null}

        {somenteLeitura ? (
          <RodapeSomenteLeitura rotuloLink={rotuloLinkSomenteLeitura} aoLink={aoLinkSomenteLeitura} />
        ) : (
          <CampoMensagem
            texto={texto}
            textoMax={textoMax}
            aoMudarTexto={aoMudarTexto}
            podeEnviar={podeEnviar}
            aoEnviar={aoEnviar}
            aoCamera={aoCamera}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FaixaProps {
  icone: typeof Lock;
  texto: string;
  somenteLeitura?: boolean;
}

/** Aviso fixo no topo da conversa: contato (21) ou motivo do somente leitura (22). */
function Faixa({ icone, texto, somenteLeitura = false }: FaixaProps) {
  return (
    <View className="px-margem pt-3">
      <View
        className={`flex-row items-start gap-3 rounded-campo p-3.5 ${somenteLeitura ? "bg-borda/60" : "bg-marca-50"}`}
        accessibilityRole="summary"
      >
        <Icone icone={icone} tamanho={16} cor={somenteLeitura ? "suave" : "marca-escura"} />
        <Text
          className={`flex-1 text-rotulo ${somenteLeitura ? "text-tinta-suave" : "text-marca-800"}`}
        >
          {texto}
        </Text>
      </View>
    </View>
  );
}

function ConversaEncerrada() {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-px flex-1 bg-borda-campo" />
      <Text className="text-micro font-semibold text-tinta-fraco">conversa encerrada</Text>
      <View className="h-px flex-1 bg-borda-campo" />
    </View>
  );
}
