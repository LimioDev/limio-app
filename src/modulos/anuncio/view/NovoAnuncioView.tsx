import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import type { ErrosAnuncio } from "../store/rascunhoAnuncio.store";
import type { FotoExibida } from "../viewmodel/useEscolhaDeFotos";
import { CabecalhoPasso } from "./componentes/CabecalhoPasso";
import { CampoContador } from "./componentes/CampoContador";
import { CartaoCategoria } from "./componentes/CartaoCategoria";
import { FolhaAdicionarFoto } from "./componentes/FolhaAdicionarFoto";
import { GradeFotos } from "./componentes/GradeFotos";

interface NovoAnuncioViewProps {
  categoria: string | null;
  aoTrocarCategoria: () => void;
  titulo: string;
  aoMudarTitulo: (texto: string) => void;
  tituloDica: string;
  tituloMax: number;
  descricao: string;
  aoMudarDescricao: (texto: string) => void;
  descricaoMax: number;
  fotos: FotoExibida[];
  fotosMax: number;
  podeAdicionarFoto: boolean;
  preparandoFotos: boolean;
  aoAdicionarFoto: () => void;
  folhaFotoVisivel: boolean;
  aoTirarFoto: () => void;
  aoEscolherDaGaleria: () => void;
  aoFecharFolhaFoto: () => void;
  aoRemoverFoto: (chave: string) => void;
  erros: ErrosAnuncio;
  podeContinuar: boolean;
  aoContinuar: () => void;
  aoVoltar: () => void;
}

function Overline({ children }: { children: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {children}
    </Text>
  );
}

export function NovoAnuncioView({
  categoria,
  aoTrocarCategoria,
  titulo,
  aoMudarTitulo,
  tituloDica,
  tituloMax,
  descricao,
  aoMudarDescricao,
  descricaoMax,
  fotos,
  fotosMax,
  podeAdicionarFoto,
  preparandoFotos,
  aoAdicionarFoto,
  folhaFotoVisivel,
  aoTirarFoto,
  aoEscolherDaGaleria,
  aoFecharFolhaFoto,
  aoRemoverFoto,
  erros,
  podeContinuar,
  aoContinuar,
  aoVoltar,
}: NovoAnuncioViewProps) {
  const fotosRecusadas = fotos.filter((foto) => foto.erro);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoPasso passo={1} total={2} aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-6 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <Overline>Categoria</Overline>
            <CartaoCategoria
              categoria={categoria}
              aoTrocar={aoTrocarCategoria}
              erro={erros.categoria}
            />
            {erros.categoria ? (
              <Text className="text-rotulo text-perigo">{erros.categoria}</Text>
            ) : null}
            <Text className="text-rotulo text-tinta-fraco">
              Uma categoria por anúncio. Use Outros se nenhuma servir.
            </Text>
          </View>

          <CampoContador
            rotulo="Título"
            valor={titulo}
            aoMudar={aoMudarTitulo}
            maximo={tituloMax}
            dica={tituloDica}
            placeholder="Ex.: Instalar 3 tomadas e trocar disjuntor"
            erro={erros.titulo}
          />

          <CampoContador
            rotulo="O que precisa ser feito"
            valor={descricao}
            aoMudar={aoMudarDescricao}
            maximo={descricaoMax}
            placeholder="Conte o serviço, o que já tem no local e o que o prestador precisa levar."
            multilinha
            erro={erros.descricao}
          />

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Overline>Fotos</Overline>
              <Text className="text-rotulo text-tinta-fraco">
                opcional · visíveis no mural · até {fotosMax}
              </Text>
            </View>
            <GradeFotos
              fotos={fotos}
              aoRemover={aoRemoverFoto}
              aoAdicionar={aoAdicionarFoto}
              podeAdicionar={podeAdicionarFoto || preparandoFotos}
              adicionando={preparandoFotos}
            />
            {fotosRecusadas.map((foto) => (
              <Text key={foto.chave} className="text-rotulo text-perigo">
                Foto {fotos.indexOf(foto) + 1}: {foto.erro}
              </Text>
            ))}
            {erros.fotos ? <Text className="text-rotulo text-perigo">{erros.fotos}</Text> : null}
          </View>
        </ScrollView>

        <View className="border-t border-borda bg-superficie px-margem py-4">
          <Botao rotulo="Continuar" onPress={aoContinuar} disabled={!podeContinuar} />
        </View>
      </KeyboardAvoidingView>

      <FolhaAdicionarFoto
        visivel={folhaFotoVisivel}
        aoTirarFoto={aoTirarFoto}
        aoEscolherDaGaleria={aoEscolherDaGaleria}
        aoFechar={aoFecharFolhaFoto}
      />
    </SafeAreaView>
  );
}
