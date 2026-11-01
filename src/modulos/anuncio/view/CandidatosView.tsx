import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import type {
  CandidatoExibido,
  CandidatosVazioExibido,
  FolhaRecusarExibida,
} from "../viewmodel/useCandidatosViewModel";
import { CartaoCandidato } from "./componentes/CartaoCandidato";
import { FolhaRecusarCandidato } from "./componentes/FolhaRecusarCandidato";

interface CandidatosViewProps {
  tituloAnuncio: string | null;
  carregando: boolean;
  erro: string | null;
  podeTentarDeNovo: boolean;
  aoTentarDeNovo: () => void;
  candidatos: CandidatoExibido[] | null;
  vazio: CandidatosVazioExibido;
  atualizando: boolean;
  aoAtualizar: () => void;
  aoVoltar: () => void;
  aoRecusar: (candidaturaId: string) => void;
  aoConversar: (candidaturaId: string) => void;
  aoEscolher?: (candidaturaId: string) => void;
  aoVerPerfil?: (candidaturaId: string) => void;
  aoEditarAnuncio?: () => void;
  folha: FolhaRecusarExibida;
  aoConfirmarRecusa: () => void;
  aoFecharFolha: () => void;
}

function Cabecalho({ titulo, aoVoltar }: { titulo: string | null; aoVoltar: () => void }) {
  return (
    <View className="flex-row items-start gap-1 px-margem pb-3 pt-2">
      <Pressable
        onPress={aoVoltar}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="h-toque w-8 items-center justify-center"
      >
        <Icone icone={ChevronLeft} tamanho={24} cor="tinta" />
      </Pressable>
      <View className="flex-1 justify-center pt-2.5">
        <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
          Candidatos
        </Text>
        {titulo ? (
          <Text className="text-rotulo text-tinta-fraco" numberOfLines={1}>
            {titulo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Aviso({ icone, texto, fundo }: { icone: LucideIcon; texto: string; fundo: string }) {
  return (
    <View className={`flex-row items-start gap-3 rounded-card p-4 ${fundo}`}>
      <Icone icone={icone} cor="marca-escura" />
      <Text className="flex-1 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

function Dica({
  icone,
  rotulo,
  aoTocar,
}: {
  icone: LucideIcon;
  rotulo: string;
  aoTocar?: () => void;
}) {
  return (
    <Pressable
      onPress={aoTocar}
      disabled={!aoTocar}
      accessibilityRole="button"
      accessibilityState={{ disabled: !aoTocar }}
      accessibilityHint={aoTocar ? "Abre a edição do anúncio" : "Disponível em breve"}
      className="flex-row items-center gap-3 rounded-card border border-borda bg-superficie px-4 py-4 active:opacity-70"
    >
      <Icone icone={icone} tamanho={18} cor="marca-escura" />
      <Text className="flex-1 text-corpo text-tinta">{rotulo}</Text>
      {aoTocar ? <Icone icone={ChevronRight} tamanho={18} cor="fraco" /> : null}
    </Pressable>
  );
}

/** Tela 19: ninguém se candidatou (ou o último candidato foi recusado). */
function SemCandidatos({
  vazio,
  aoEditarAnuncio,
}: {
  vazio: CandidatosVazioExibido;
  aoEditarAnuncio?: () => void;
}) {
  const categoria = vazio.categoria ? `de ${vazio.categoria} ` : "";
  return (
    <View className="gap-6">
      <View className="items-center gap-3 pt-6">
        {/* Anéis do protótipo em volta do ícone. */}
        <View className="h-52 w-52 items-center justify-center rounded-full border border-marca-100">
          <View className="h-36 w-36 items-center justify-center rounded-full border border-marca-100">
            <View className="h-20 w-20 items-center justify-center rounded-full border border-marca-100">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-marca-50">
                <Icone icone={User} tamanho={20} cor="marca" />
              </View>
            </View>
          </View>
        </View>
        <Text className="mt-4 text-center text-secao font-bold text-tinta">
          Ninguém se candidatou ainda
        </Text>
        <Text className="text-center text-corpo text-tinta-suave">
          O anúncio está no mural dos prestadores {categoria}dentro do raio de atendimento
          deles.
        </Text>
      </View>

      <View className="gap-2.5">
        <Text className="text-overline font-bold uppercase tracking-[0.8px] text-tinta-fraco">
          O que costuma ajudar
        </Text>
        <Dica icone={ImageIcon} rotulo="Adicionar fotos do local" aoTocar={aoEditarAnuncio} />
        <Dica
          icone={FileText}
          rotulo="Detalhar o que precisa ser feito"
          aoTocar={aoEditarAnuncio}
        />
        <Dica icone={CalendarDays} rotulo={vazio.reverData} aoTocar={aoEditarAnuncio} />
      </View>

      <Aviso
        icone={ShieldCheck}
        fundo="bg-marca-50"
        texto="Sem nenhuma candidatura, o anúncio expira sozinho depois da data agendada."
      />
    </View>
  );
}

export function CandidatosView({
  tituloAnuncio,
  carregando,
  erro,
  podeTentarDeNovo,
  aoTentarDeNovo,
  candidatos,
  vazio,
  atualizando,
  aoAtualizar,
  aoVoltar,
  aoRecusar,
  aoConversar,
  aoEscolher,
  aoVerPerfil,
  aoEditarAnuncio,
  folha,
  aoConfirmarRecusa,
  aoFecharFolha,
}: CandidatosViewProps) {
  if (carregando || erro || !candidatos) {
    return (
      <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
        <Cabecalho titulo={tituloAnuncio} aoVoltar={aoVoltar} />
        {carregando ? (
          <Carregando />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-margem">
            <Text className="text-center text-corpo text-tinta-suave">
              {erro ?? "Não foi possível carregar os candidatos."}
            </Text>
            <Botao
              rotulo={podeTentarDeNovo ? "Tentar de novo" : "Voltar"}
              variante="contorno"
              tamanho="padrao"
              onPress={podeTentarDeNovo ? aoTentarDeNovo : aoVoltar}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const refresh = <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} />;

  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top"]}>
      <Cabecalho titulo={tituloAnuncio} aoVoltar={aoVoltar} />

      {candidatos.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-margem pb-8"
          refreshControl={refresh}
        >
          <SemCandidatos vazio={vazio} aoEditarAnuncio={aoEditarAnuncio} />
        </ScrollView>
      ) : (
        <FlatList
          data={candidatos}
          keyExtractor={(candidato) => candidato.candidaturaId}
          contentContainerClassName="gap-3 px-margem pb-8"
          refreshControl={refresh}
          ListHeaderComponent={
            <Aviso
              icone={ShieldCheck}
              fundo="bg-marca-50"
              texto="Ao escolher, você libera telefone e endereço só para essa pessoa."
            />
          }
          renderItem={({ item }) => (
            <CartaoCandidato
              candidato={item}
              travado={folha.enviando}
              aoRecusar={() => aoRecusar(item.candidaturaId)}
              aoConversar={() => aoConversar(item.candidaturaId)}
              aoEscolher={aoEscolher ? () => aoEscolher(item.candidaturaId) : undefined}
              aoVerPerfil={aoVerPerfil ? () => aoVerPerfil(item.candidaturaId) : undefined}
            />
          )}
        />
      )}

      <FolhaRecusarCandidato
        folha={folha}
        aoConfirmar={aoConfirmarRecusa}
        aoFechar={aoFecharFolha}
      />
    </SafeAreaView>
  );
}
