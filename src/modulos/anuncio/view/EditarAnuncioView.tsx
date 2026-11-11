import { CalendarDays, Clock } from "lucide-react-native";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Masks, type Mask } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import type { ErrosEdicao } from "../store/edicaoAnuncio.store";
import type { FotoExibida } from "../viewmodel/useNovoAnuncioViewModel";
import { CampoContador } from "./componentes/CampoContador";
import { CartaoCategoria } from "./componentes/CartaoCategoria";
import { FolhaAdicionarFoto } from "./componentes/FolhaAdicionarFoto";
import { GradeFotos } from "./componentes/GradeFotos";

const MASCARA_HORA: Mask = [/\d/, /\d/, ":", /\d/, /\d/];

interface EditarAnuncioViewProps {
  carregando: boolean;
  erro: string | null;
  aoTentarDeNovo: () => void;
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
  podeAdicionarFoto: boolean;
  preparandoFotos: boolean;
  aoAdicionarFoto: () => void;
  folhaFotoVisivel: boolean;
  aoTirarFoto: () => void;
  aoEscolherDaGaleria: () => void;
  aoFecharFolhaFoto: () => void;
  aoRemoverFoto: (chave: string) => void;
  data: string;
  aoMudarData: (texto: string) => void;
  hora: string;
  aoMudarHora: (texto: string) => void;
  tamanhoLocal: string;
  aoMudarTamanhoLocal: (texto: string) => void;
  tamanhoLocalMax: number;
  numeroPessoas: string;
  aoMudarNumeroPessoas: (texto: string) => void;
  observacoes: string;
  aoMudarObservacoes: (texto: string) => void;
  erros: ErrosEdicao;
  erroServidor: string | null;
  salvando: boolean;
  podeSalvar: boolean;
  aoSalvar: () => void;
  aoVoltar: () => void;
}

function Overline({ children }: { children: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {children}
    </Text>
  );
}

/** Tela 16a "Editar anúncio": os campos da criação numa tela só, sem o endereço. */
export function EditarAnuncioView({
  carregando,
  erro,
  aoTentarDeNovo,
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
  podeAdicionarFoto,
  preparandoFotos,
  aoAdicionarFoto,
  folhaFotoVisivel,
  aoTirarFoto,
  aoEscolherDaGaleria,
  aoFecharFolhaFoto,
  aoRemoverFoto,
  data,
  aoMudarData,
  hora,
  aoMudarHora,
  tamanhoLocal,
  aoMudarTamanhoLocal,
  tamanhoLocalMax,
  numeroPessoas,
  aoMudarNumeroPessoas,
  observacoes,
  aoMudarObservacoes,
  erros,
  erroServidor,
  salvando,
  podeSalvar,
  aoSalvar,
  aoVoltar,
}: EditarAnuncioViewProps) {
  if (carregando || erro) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <CabecalhoVoltar titulo="Editar anúncio" aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">{erro}</Text>
            <Botao
              rotulo="Tentar de novo"
              variante="contorno"
              tamanho="padrao"
              onPress={aoTentarDeNovo}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const fotosRecusadas = fotos.filter((foto) => foto.erro);

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Editar anúncio" aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-margem"
          contentContainerClassName="gap-6 pb-6 pt-4"
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
              <Text className="text-rotulo text-tinta-fraco">opcional · visíveis no mural</Text>
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

          {/* "Não está no futuro" aparece na data: o instante é a data com a hora. */}
          <View className="flex-row items-start gap-4">
            <View className="flex-1">
              <Campo
                rotulo="Data"
                icone={CalendarDays}
                value={data}
                onChangeText={aoMudarData}
                mask={Masks.DATE_DDMMYYYY}
                keyboardType="number-pad"
                placeholder="dd/mm/aaaa"
                erro={erros.data}
              />
            </View>
            <View className="flex-1">
              <Campo
                rotulo="Hora"
                icone={Clock}
                value={hora}
                onChangeText={aoMudarHora}
                mask={MASCARA_HORA}
                keyboardType="number-pad"
                placeholder="hh:mm"
                erro={erros.hora}
              />
            </View>
          </View>

          <View className="gap-2">
            <Overline>Detalhes opcionais</Overline>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Campo
                  rotulo="Tamanho do local"
                  value={tamanhoLocal}
                  onChangeText={aoMudarTamanhoLocal}
                  placeholder="Ex.: 72 m²"
                  maxLength={tamanhoLocalMax}
                  erro={erros.tamanhoLocal}
                />
              </View>
              <View className="flex-1">
                <Campo
                  rotulo="Pessoas no local"
                  value={numeroPessoas}
                  onChangeText={aoMudarNumeroPessoas}
                  placeholder="Ex.: 2"
                  keyboardType="number-pad"
                  maxLength={4}
                  erro={erros.numeroPessoas}
                />
              </View>
            </View>
            <CampoContador
              rotulo="Observações"
              dica="opcional"
              estiloRotulo="campo"
              valor={observacoes}
              aoMudar={aoMudarObservacoes}
              placeholder="Ex.: portão azul, interfone 12. Tem escada no local."
              multilinha
              erro={erros.observacoes}
            />
          </View>

          <View className="rounded-card bg-alerta-fundo p-4">
            <Text className="text-rotulo text-alerta">
              Editar só vale enquanto o anúncio aguarda candidatos. Depois da escolha, a data só
              muda por reagendamento.
            </Text>
          </View>

          {erroServidor ? (
            <Text className="text-rotulo text-perigo">{erroServidor}</Text>
          ) : null}
        </ScrollView>

        <View className="border-t border-borda bg-superficie px-margem py-4">
          <Botao
            rotulo={salvando ? "Salvando..." : "Salvar alterações"}
            onPress={aoSalvar}
            carregando={salvando}
            disabled={!podeSalvar}
          />
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
