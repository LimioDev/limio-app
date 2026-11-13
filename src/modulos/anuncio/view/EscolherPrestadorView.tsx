import {
  CircleAlert,
  CircleCheck,
  Gem,
  Megaphone,
  TriangleAlert,
  User,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../comum/componentes/ui/Botao";
import { Carregando } from "../../../comum/componentes/ui/Carregando";
import { Icone } from "../../../comum/componentes/ui/Icone";
import { EtapaEscolha } from "../tipos/anuncio.enums";
import type {
  CandidatoEscolhaExibido,
  ConsequenciasExibidas,
  CotaEsgotadaExibida,
} from "../viewmodel/useEscolherPrestadorViewModel";

interface EscolherPrestadorViewProps {
  etapa: EtapaEscolha;
  candidato: CandidatoEscolhaExibido | null;
  consequencias: ConsequenciasExibidas;
  cotaEsgotada: CotaEsgotadaExibida;
  enviando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoFechar: () => void;
  aoEscolherOutro: () => void;
}

function Item({ icone, texto }: { icone: LucideIcon; texto: string }) {
  return (
    <View className="flex-row items-center gap-3.5">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-marca-50">
        <Icone icone={icone} tamanho={14} cor="marca-escura" />
      </View>
      <Text className="flex-1 text-rotulo text-tinta-suave">{texto}</Text>
    </View>
  );
}

function LinkVoltar({ aoTocar, desligado }: { aoTocar: () => void; desligado: boolean }) {
  return (
    <Pressable
      onPress={aoTocar}
      disabled={desligado}
      accessibilityRole="button"
      className="items-center py-3 active:opacity-70"
    >
      <Text
        className={`text-corpo font-semibold ${desligado ? "text-tinta-fraco" : "text-tinta-suave"}`}
      >
        Voltar
      </Text>
    </Pressable>
  );
}

/** Tela 23: o que acontece ao escolher, com "Confirmar escolha". */
function Confirmar({
  candidato,
  consequencias,
  enviando,
  erro,
  aoConfirmar,
  aoFechar,
}: {
  candidato: CandidatoEscolhaExibido;
  consequencias: ConsequenciasExibidas;
  enviando: boolean;
  erro: string | null;
  aoConfirmar: () => void;
  aoFechar: () => void;
}) {
  return (
    <>
      <View className="flex-row items-center gap-3.5">
        <Avatar
          nome={candidato.nome}
          fotoUrl={candidato.fotoUrl}
          cacheKey={candidato.cacheKey}
          tamanho={56}
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-secao font-bold text-tinta" accessibilityRole="header">
            Escolher {candidato.nome}?
          </Text>
          <Text className="text-rotulo text-tinta-fraco" numberOfLines={2}>
            {candidato.resumo}
          </Text>
        </View>
      </View>

      <View className="gap-4">
        <Item icone={CircleCheck} texto={consequencias.contato} />
        {consequencias.outros ? <Item icone={X} texto={consequencias.outros} /> : null}
        <Item icone={Megaphone} texto={consequencias.mural} />
        {consequencias.cota ? <Item icone={Gem} texto={consequencias.cota} /> : null}
      </View>

      <View className="flex-row items-center gap-3 rounded-card bg-alerta-fundo p-3.5">
        <Icone icone={TriangleAlert} tamanho={18} cor="alerta" />
        <Text className="flex-1 text-rotulo text-alerta">
          O pagamento acontece fora do app, depois que você validar.
        </Text>
      </View>

      {erro ? (
        <View
          className="flex-row gap-3 rounded-campo border border-perigo-borda bg-perigo-fundo p-3.5"
          accessibilityRole="alert"
        >
          <Icone icone={CircleAlert} tamanho={18} cor="perigo" />
          <Text className="flex-1 text-rotulo text-perigo">{erro}</Text>
        </View>
      ) : null}

      <View className="gap-1">
        {/* Desligado durante a chamada: evita escolher duas vezes. */}
        <Botao
          rotulo="Confirmar escolha"
          carregando={enviando}
          disabled={enviando}
          onPress={aoConfirmar}
        />
        <LinkVoltar aoTocar={aoFechar} desligado={enviando} />
      </View>
    </>
  );
}

/** Tela 24: a cota do candidato acabou entre a candidatura e a escolha. */
function CotaEsgotada({
  nome,
  cotaEsgotada,
  aoEscolherOutro,
  aoFechar,
}: {
  nome: string;
  cotaEsgotada: CotaEsgotadaExibida;
  aoEscolherOutro: () => void;
  aoFechar: () => void;
}) {
  return (
    <>
      <View className="gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-card bg-alerta-fundo">
          <Icone icone={TriangleAlert} tamanho={20} cor="alerta" />
        </View>
        <Text className="text-titulo font-bold text-tinta" accessibilityRole="header">
          Não foi possível escolher {nome}
        </Text>
        <Text className="text-corpo text-tinta-suave">{cotaEsgotada.texto}</Text>
      </View>

      <View className="gap-4">
        <Item icone={User} texto={cotaEsgotada.outros} />
        <Item
          icone={Megaphone}
          texto="Seu anúncio não mudou de estado — segue aguardando candidatos."
        />
      </View>

      <View className="gap-1">
        <Botao rotulo="Escolher outro candidato" onPress={aoEscolherOutro} />
        <LinkVoltar aoTocar={aoFechar} desligado={false} />
      </View>
    </>
  );
}

/**
 * Telas 23 e 24: folha de baixo numa rota transparente, por cima da tela 18
 * ou do chat. A tela de baixo continua aparecendo atrás do véu.
 */
export function EscolherPrestadorView({
  etapa,
  candidato,
  consequencias,
  cotaEsgotada,
  enviando,
  erro,
  aoConfirmar,
  aoFechar,
  aoEscolherOutro,
}: EscolherPrestadorViewProps) {
  return (
    <View className="flex-1 justify-end">
      <Pressable
        onPress={aoFechar}
        accessibilityLabel="Fechar"
        className="absolute inset-0 bg-marca-900/40"
      />
      <SafeAreaView edges={["bottom"]} className="rounded-t-sheet bg-superficie">
        <View className="items-center pt-3">
          <View className="h-1 w-10 rounded-full bg-marca-100" />
        </View>
        <View className="gap-5 px-margem pb-4 pt-4">
          {!candidato ? (
            <View className="h-40">
              <Carregando />
            </View>
          ) : etapa === EtapaEscolha.COTA_ESGOTADA ? (
            <CotaEsgotada
              nome={candidato.nome}
              cotaEsgotada={cotaEsgotada}
              aoEscolherOutro={aoEscolherOutro}
              aoFechar={aoFechar}
            />
          ) : (
            <Confirmar
              candidato={candidato}
              consequencias={consequencias}
              enviando={enviando}
              erro={erro}
              aoConfirmar={aoConfirmar}
              aoFechar={aoFechar}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
