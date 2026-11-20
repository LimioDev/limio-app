import { Image } from "expo-image";
import { Camera, ImageIcon, ShieldCheck, User, X } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";
import { FolhaAdicionarFoto } from "../../../comum/componentes/ui/FolhaAdicionarFoto";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type { MotivoDenuncia } from "../tipos/denuncia.enums";
import type { MotivoExibido } from "../viewmodel/useDenunciaViewModel";

interface DenunciaViewProps {
  titulo: string;
  detalhe: string;
  alvoEhPerfil: boolean;
  motivos: MotivoExibido[];
  motivo: MotivoDenuncia | null;
  aoEscolherMotivo: (motivo: MotivoDenuncia) => void;
  descricao: string;
  aoMudarDescricao: (texto: string) => void;
  descricaoMax: number;
  fotoUri: string | null;
  /** Foto recusada no preparo ou pela API (`FOTO_INVALIDA`). */
  erroFoto: string | null;
  preparandoFoto: boolean;
  aoAdicionarFoto: () => void;
  aoRemoverFoto: () => void;
  folhaFotoVisivel: boolean;
  aoTirarFoto: () => void;
  aoEscolherDaGaleria: () => void;
  aoFecharFolhaFoto: () => void;
  podeEnviar: boolean;
  enviando: boolean;
  erroEnvio: string | null;
  aoEnviar: () => void;
  aoVoltar: () => void;
}

const LADO_FOTO = 96;

function Rotulo({ texto }: { texto: string }) {
  return (
    <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
      {texto}
    </Text>
  );
}

/** Card do alvo: "Limpeza pós-obra do apartamento" · "Concluído em 31/08 · com Marcos V.". */
function CardAlvo({
  titulo,
  detalhe,
  alvoEhPerfil,
}: Pick<DenunciaViewProps, "titulo" | "detalhe" | "alvoEhPerfil">) {
  return (
    <View className="flex-row items-center gap-3 rounded-card border border-borda bg-superficie p-3.5">
      <View className="h-14 w-14 items-center justify-center rounded-campo border border-marca-100 bg-marca-50">
        <Icone icone={alvoEhPerfil ? User : ImageIcon} tamanho={20} cor="marca" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-corpo font-bold text-tinta" numberOfLines={2}>
          {titulo}
        </Text>
        {detalhe ? (
          <Text className="text-rotulo text-tinta-fraco" numberOfLines={2}>
            {detalhe}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function OpcaoMotivo({
  rotulo,
  selecionado,
  aoPressionar,
}: {
  rotulo: string;
  selecionado: boolean;
  aoPressionar: () => void;
}) {
  return (
    <Pressable
      onPress={aoPressionar}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={rotulo}
      className={`flex-row items-center gap-3 rounded-campo bg-superficie px-4 py-4 active:opacity-80 ${
        selecionado ? "border-2 border-marca-500" : "border border-borda"
      }`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
          selecionado ? "border-marca-500" : "border-borda-campo"
        }`}
      >
        {selecionado ? <View className="h-2.5 w-2.5 rounded-full bg-marca-500" /> : null}
      </View>
      <Text
        className={`flex-1 text-corpo ${selecionado ? "font-bold text-tinta" : "text-tinta-suave"}`}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

/** "Foto de comprovação": vazio abre câmera/galeria; com foto mostra a miniatura e o "x". */
function BotaoFoto({
  fotoUri,
  erroFoto,
  preparandoFoto,
  aoAdicionarFoto,
  aoRemoverFoto,
  desabilitado,
}: Pick<
  DenunciaViewProps,
  "fotoUri" | "erroFoto" | "preparandoFoto" | "aoAdicionarFoto" | "aoRemoverFoto"
> & { desabilitado: boolean }) {
  const borda = erroFoto ? "border-perigo-borda" : "border-borda-campo";

  if (fotoUri) {
    return (
      <View style={{ width: LADO_FOTO }}>
        <Pressable
          onPress={aoAdicionarFoto}
          disabled={desabilitado}
          accessibilityRole="button"
          accessibilityLabel="Trocar foto de comprovação"
          className={`flex-1 overflow-hidden rounded-campo border ${borda}`}
        >
          <Image source={{ uri: fotoUri }} style={{ flex: 1 }} contentFit="cover" />
        </Pressable>
        <Pressable
          onPress={aoRemoverFoto}
          disabled={desabilitado}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remover foto de comprovação"
          className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-marca-900/70"
        >
          <Icone icone={X} tamanho={14} cor="branco" />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={aoAdicionarFoto}
      disabled={desabilitado || preparandoFoto}
      accessibilityRole="button"
      accessibilityLabel="Foto de comprovação, opcional"
      style={{ width: LADO_FOTO }}
      className={`items-center justify-center gap-1.5 rounded-campo border bg-superficie px-2 active:opacity-80 ${borda}`}
    >
      {preparandoFoto ? (
        <ActivityIndicator color="#2159CC" />
      ) : (
        <>
          <Icone icone={Camera} tamanho={20} cor="marca" />
          <Text className="text-center text-micro font-bold text-marca-500">
            Foto de comprovação
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** Tela 46 "Abrir denúncia". */
export function DenunciaView({
  titulo,
  detalhe,
  alvoEhPerfil,
  motivos,
  motivo,
  aoEscolherMotivo,
  descricao,
  aoMudarDescricao,
  descricaoMax,
  fotoUri,
  erroFoto,
  preparandoFoto,
  aoAdicionarFoto,
  aoRemoverFoto,
  folhaFotoVisivel,
  aoTirarFoto,
  aoEscolherDaGaleria,
  aoFecharFolhaFoto,
  podeEnviar,
  enviando,
  erroEnvio,
  aoEnviar,
  aoVoltar,
}: DenunciaViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Abrir denúncia" aoVoltar={aoVoltar} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-3 px-margem pb-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <CardAlvo titulo={titulo} detalhe={detalhe} alvoEhPerfil={alvoEhPerfil} />

          <View className="gap-2 pt-1">
            <Rotulo texto="Motivo" />
            <View className="gap-2" accessibilityRole="radiogroup">
              {motivos.map((opcao) => (
                <OpcaoMotivo
                  key={opcao.valor}
                  rotulo={opcao.rotulo}
                  selecionado={motivo === opcao.valor}
                  aoPressionar={() => aoEscolherMotivo(opcao.valor)}
                />
              ))}
            </View>
          </View>

          <View className="gap-2 pt-1">
            <Rotulo texto="O que aconteceu" />
            <View className="flex-row gap-2" style={{ minHeight: LADO_FOTO }}>
              <View className="flex-1 rounded-campo border border-borda-campo bg-superficie px-4 py-3">
                <TextInput
                  className="flex-1 text-corpo text-tinta"
                  value={descricao}
                  onChangeText={aoMudarDescricao}
                  maxLength={descricaoMax}
                  multiline
                  textAlignVertical="top"
                  placeholder="Conte o que aconteceu"
                  placeholderTextColor="#7B87A4"
                  selectionColor="#2159CC"
                  editable={!enviando}
                  accessibilityLabel="O que aconteceu"
                />
              </View>
              <BotaoFoto
                fotoUri={fotoUri}
                erroFoto={erroFoto}
                preparandoFoto={preparandoFoto}
                aoAdicionarFoto={aoAdicionarFoto}
                aoRemoverFoto={aoRemoverFoto}
                desabilitado={enviando}
              />
            </View>
            {erroFoto ? <Text className="text-rotulo text-perigo">{erroFoto}</Text> : null}
          </View>

          <View
            className="mt-2 flex-row gap-3 rounded-card border border-borda bg-marca-50 p-4"
            accessibilityRole="summary"
          >
            <Icone icone={ShieldCheck} tamanho={18} cor="suave" />
            <Text className="flex-1 text-rotulo text-tinta-suave">
              O LIMIO não estorna nem transfere valores. A denúncia serve para moderar a conta.
            </Text>
          </View>
        </ScrollView>

        <View className="gap-2 px-margem pb-3 pt-2">
          {erroEnvio ? (
            <Text className="text-center text-rotulo text-perigo">{erroEnvio}</Text>
          ) : null}
          <Botao
            rotulo="Enviar denúncia"
            onPress={aoEnviar}
            disabled={!podeEnviar}
            carregando={enviando}
          />
        </View>
      </KeyboardAvoidingView>

      <FolhaAdicionarFoto
        visivel={folhaFotoVisivel}
        aoTirarFoto={aoTirarFoto}
        aoEscolherDaGaleria={aoEscolherDaGaleria}
        aoFechar={aoFecharFolhaFoto}
        descricao="Escolha de onde vem a foto de comprovação."
      />
    </SafeAreaView>
  );
}
