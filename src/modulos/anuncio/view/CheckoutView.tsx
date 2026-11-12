import { CircleAlert, TriangleAlert } from "lucide-react-native";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  FolhaRemoverFotoExibida,
  FotoCheckoutExibida,
} from "../viewmodel/useCheckoutViewModel";
import { CampoContador } from "./componentes/CampoContador";
import { FolhaAdicionarFoto } from "./componentes/FolhaAdicionarFoto";
import { FolhaRemoverFoto } from "./componentes/FolhaRemoverFoto";
import { GradeFotosCheckout } from "./componentes/GradeFotosCheckout";

interface CheckoutViewProps {
  empregador: string;
  avisoValidacao: string;
  fotos: FotoCheckoutExibida[];
  fotosMax: number;
  podeAdicionarFoto: boolean;
  preparandoFotos: boolean;
  erroFotos: string | null;
  aoAdicionarFoto: () => void;
  folhaFotoVisivel: boolean;
  aoTirarFoto: () => void;
  aoEscolherDaGaleria: () => void;
  aoFecharFolhaFoto: () => void;
  aoTocarFoto: (chave: string) => void;
  folhaRemover: FolhaRemoverFotoExibida;
  aoConfirmarRemocao: () => void;
  aoFecharFolhaRemover: () => void;
  observacao: string;
  aoMudarObservacao: (texto: string) => void;
  podeEnviar: boolean;
  enviando: boolean;
  erroEnvio: string | null;
  aoEnviar: () => void;
  aoVoltar: () => void;
}

/** Tela 38 "Checkout" do Prestador escolhido: fotos do serviço pronto e observação. */
export function CheckoutView({
  empregador,
  avisoValidacao,
  fotos,
  fotosMax,
  podeAdicionarFoto,
  preparandoFotos,
  erroFotos,
  aoAdicionarFoto,
  folhaFotoVisivel,
  aoTirarFoto,
  aoEscolherDaGaleria,
  aoFecharFolhaFoto,
  aoTocarFoto,
  folhaRemover,
  aoConfirmarRemocao,
  aoFecharFolhaRemover,
  observacao,
  aoMudarObservacao,
  podeEnviar,
  enviando,
  erroEnvio,
  aoEnviar,
  aoVoltar,
}: CheckoutViewProps) {
  const recusadas = fotos.filter((foto) => foto.erro);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Checkout" aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-5 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1">
            <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
              Envie uma foto do serviço
            </Text>
            <Text className="text-corpo text-tinta-suave">
              Adicione uma ou mais fotos do trabalho finalizado. Isso ajuda {empregador} a
              aprovar o serviço mais rápido caso não esteja no local.
            </Text>
          </View>

          <View className="gap-2">
            <GradeFotosCheckout
              fotos={fotos}
              aoTocarFoto={aoTocarFoto}
              aoAdicionar={aoAdicionarFoto}
              podeAdicionar={podeAdicionarFoto}
              adicionando={preparandoFotos}
              comErro={erroFotos !== null && recusadas.length === 0}
            />
            {recusadas.map((foto) => (
              <Text key={foto.chave} className="text-rotulo text-perigo">
                Foto {fotos.indexOf(foto) + 1}: {foto.erro}
              </Text>
            ))}
            {erroFotos ? (
              <View className="flex-row items-center gap-1.5">
                <Icone icone={CircleAlert} tamanho={14} cor="perigo" />
                <Text className="flex-1 text-rotulo text-perigo">{erroFotos}</Text>
              </View>
            ) : (
              <Text className="text-rotulo text-tinta-fraco">
                Ao menos 1 foto · até {fotosMax} · JPG ou PNG
              </Text>
            )}
          </View>

          <CampoContador
            rotulo="Observação"
            dica="opcional"
            valor={observacao}
            aoMudar={aoMudarObservacao}
            placeholder="Conte algo que o Empregador precise saber sobre o serviço."
            multilinha
          />

          <View
            className="flex-row gap-3 rounded-card bg-alerta-fundo p-4"
            accessibilityRole="summary"
          >
            <Icone icone={TriangleAlert} tamanho={18} cor="alerta" />
            <View className="flex-1 gap-0.5">
              <Text className="text-rotulo font-bold text-alerta">Próximo passo: Validação</Text>
              <Text className="text-rotulo text-alerta">{avisoValidacao}</Text>
            </View>
          </View>
        </ScrollView>

        <View className="gap-2 border-t border-borda bg-superficie px-margem py-3">
          {erroEnvio ? (
            <Text className="text-center text-rotulo text-perigo">{erroEnvio}</Text>
          ) : null}
          <Botao
            rotulo="Enviar check-out"
            onPress={aoEnviar}
            disabled={!podeEnviar}
            carregando={enviando}
          />
          <Text className="text-center text-rotulo text-tinta-fraco">
            O serviço passa para Aguardando validação
          </Text>
        </View>
      </KeyboardAvoidingView>

      <FolhaAdicionarFoto
        visivel={folhaFotoVisivel}
        aoTirarFoto={aoTirarFoto}
        aoEscolherDaGaleria={aoEscolherDaGaleria}
        aoFechar={aoFecharFolhaFoto}
        descricao="Escolha de onde vem a foto do check-out."
      />
      <FolhaRemoverFoto
        folha={folhaRemover}
        aoConfirmar={aoConfirmarRemocao}
        aoFechar={aoFecharFolhaRemover}
      />
    </SafeAreaView>
  );
}
