import { MapPin, Plus, ShieldCheck } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { CabecalhoVoltar } from "./componentes/CabecalhoVoltar";
import type { EnderecoExibido } from "../viewmodel/useEnderecosSalvosViewModel";
import { CartaoEndereco } from "./componentes/CartaoEndereco";
import { ModalConfirmacao } from "./componentes/ModalConfirmacao";

interface EnderecosSalvosViewProps {
  carregando: boolean;
  erroCarregamento: string | null;
  atualizando: boolean;
  aoAtualizar: () => void;
  enderecos: EnderecoExibido[];
  ocupadoId: string | null;
  erroAcao: string | null;
  aoNovo: () => void;
  aoEditar: (id: string) => void;
  aoTornarPadrao: (id: string) => void;
  aoPedirRemocao: (endereco: EnderecoExibido) => void;
  paraRemover: EnderecoExibido | null;
  aoCancelarRemocao: () => void;
  aoConfirmarRemocao: () => void;
  aoVoltar: () => void;
}

function AvisoPrivacidade() {
  return (
    <View className="flex-row gap-3 rounded-card bg-marca-50 p-4">
      <Icone icone={ShieldCheck} tamanho={18} cor="marca-escura" />
      <Text className="flex-1 text-[12.5px] leading-[18px] text-marca-700">
        Um anúncio pode usar um endereço salvo ou um endereço avulso. O endereço
        completo só aparece para o prestador escolhido.
      </Text>
    </View>
  );
}

function ListaVazia({ aoNovo }: { aoNovo: () => void }) {
  return (
    <View className="items-center gap-3 rounded-card border border-borda bg-superficie px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={MapPin} tamanho={26} cor="marca" />
      </View>
      <Text className="text-[17px] font-bold text-tinta">Nenhum endereço salvo</Text>
      <Text className="text-center text-rotulo text-tinta-suave">
        Salve os lugares onde você costuma contratar serviços e escolha um deles
        ao criar um anúncio.
      </Text>
      <View className="self-stretch pt-2">
        <Botao rotulo="Adicionar endereço" icone={Plus} tamanho="padrao" onPress={aoNovo} />
      </View>
    </View>
  );
}

export function EnderecosSalvosView({
  carregando,
  erroCarregamento,
  atualizando,
  aoAtualizar,
  enderecos,
  ocupadoId,
  erroAcao,
  aoNovo,
  aoEditar,
  aoTornarPadrao,
  aoPedirRemocao,
  paraRemover,
  aoCancelarRemocao,
  aoConfirmarRemocao,
  aoVoltar,
}: EnderecosSalvosViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <CabecalhoVoltar
        titulo="Endereços salvos"
        aoVoltar={aoVoltar}
        direita={
          <Pressable
            onPress={aoNovo}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Novo endereço"
            className="h-toque justify-center active:opacity-60"
          >
            <Text className="text-[14.5px] font-bold text-marca-500">Novo</Text>
          </Pressable>
        }
      />

      {carregando ? (
        <Carregando />
      ) : erroCarregamento ? (
        <View className="flex-1 items-center justify-center gap-4 px-margem">
          <Text className="text-center text-corpo text-tinta-suave">
            {erroCarregamento}
          </Text>
          <Botao
            rotulo="Tentar de novo"
            variante="contorno"
            tamanho="padrao"
            onPress={aoAtualizar}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-margem pb-8 pt-5"
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={aoAtualizar}
              tintColor="#2159CC"
              colors={["#2159CC"]}
            />
          }
        >
          {erroAcao ? (
            <View className="rounded-campo border border-perigo-borda bg-perigo-fundo px-4 py-3">
              <Text className="text-rotulo text-perigo">{erroAcao}</Text>
            </View>
          ) : null}

          {enderecos.length === 0 ? (
            <ListaVazia aoNovo={aoNovo} />
          ) : (
            <>
              {enderecos.map((endereco) => (
                <CartaoEndereco
                  key={endereco.id}
                  endereco={endereco}
                  ocupado={ocupadoId === endereco.id}
                  aoEditar={() => aoEditar(endereco.id)}
                  aoTornarPadrao={() => aoTornarPadrao(endereco.id)}
                  aoRemover={() => aoPedirRemocao(endereco)}
                />
              ))}

              <Pressable
                onPress={aoNovo}
                accessibilityRole="button"
                className="h-[62px] flex-row items-center gap-3 rounded-card border border-borda bg-superficie px-4 active:opacity-70"
              >
                <Icone icone={Plus} tamanho={20} cor="marca" />
                <Text className="text-[14.5px] font-bold text-marca-500">
                  Adicionar endereço
                </Text>
              </Pressable>
            </>
          )}

          <View className="pt-3">
            <AvisoPrivacidade />
          </View>
        </ScrollView>
      )}

      <ModalConfirmacao
        visivel={paraRemover !== null}
        titulo="Remover endereço?"
        mensagem={
          paraRemover
            ? `"${paraRemover.apelido}" sai da sua lista de endereços salvos.`
            : ""
        }
        rotuloConfirmar="Remover"
        aoConfirmar={aoConfirmarRemocao}
        aoCancelar={aoCancelarRemocao}
      />
    </SafeAreaView>
  );
}
