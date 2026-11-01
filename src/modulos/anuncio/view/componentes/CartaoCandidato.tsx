import { Pressable, Text, View } from "react-native";

import { Avatar } from "../../../../comum/componentes/ui/Avatar";
import { Botao } from "../../../../comum/componentes/ui/Botao";
import { Card } from "../../../../comum/componentes/ui/Card";
import { Reputacao } from "../../../../comum/componentes/ui/Reputacao";
import type { CandidatoExibido } from "../../viewmodel/useCandidatosViewModel";

interface CartaoCandidatoProps {
  candidato: CandidatoExibido;
  /** Botões travados enquanto uma recusa está em andamento. */
  travado: boolean;
  aoRecusar: () => void;
  aoConversar: () => void;
  /** Sem função, "Escolher" fica desligado (ETI-69/70). */
  aoEscolher?: () => void;
  /** Sem função, nome e foto não abrem o perfil (ETI-106). */
  aoVerPerfil?: () => void;
}

/** Um candidato da tela 18: foto, nome, GOLD, reputação, especialidades e as três ações. */
export function CartaoCandidato({
  candidato,
  travado,
  aoRecusar,
  aoConversar,
  aoEscolher,
  aoVerPerfil,
}: CartaoCandidatoProps) {
  return (
    <Card className="gap-3">
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={aoVerPerfil}
          disabled={!aoVerPerfil}
          accessibilityRole={aoVerPerfil ? "button" : undefined}
          accessibilityLabel={aoVerPerfil ? `Ver perfil de ${candidato.nome}` : undefined}
          className="flex-1 flex-row items-start gap-3"
        >
          <Avatar
            nome={candidato.nome}
            fotoUrl={candidato.fotoUrl}
            cacheKey={`candidato-${candidato.candidaturaId}`}
            tamanho={48}
          />
          <View className="flex-1 gap-1">
            <Text className="text-corpo font-bold text-tinta" numberOfLines={1}>
              {candidato.nome}
            </Text>
            {candidato.reputacao ? (
              <Reputacao
                nota={candidato.reputacao.nota}
                totalAvaliacoes={candidato.reputacao.totalAvaliacoes}
              />
            ) : (
              <Text className="text-rotulo text-tinta-suave">Sem avaliações ainda</Text>
            )}
            {candidato.especialidades ? (
              <Text className="text-rotulo text-tinta-fraco" numberOfLines={1}>
                {candidato.especialidades}
              </Text>
            ) : null}
          </View>
        </Pressable>
        {candidato.gold ? (
          <View className="rounded-full bg-gold-fundo px-2.5 py-1">
            <Text className="text-overline font-bold text-gold">GOLD</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Botao
            rotulo="Recusar"
            variante="neutro"
            tamanho="padrao"
            disabled={travado}
            onPress={aoRecusar}
            accessibilityLabel={`Recusar ${candidato.nome}`}
          />
        </View>
        <View className="flex-1">
          <Botao
            rotulo="Conversar"
            variante="neutro"
            tamanho="padrao"
            disabled={travado}
            onPress={aoConversar}
            accessibilityLabel={`Conversar com ${candidato.nome}`}
          />
        </View>
        <View className="flex-1">
          <Botao
            rotulo="Escolher"
            tamanho="padrao"
            disabled={travado || !aoEscolher}
            onPress={aoEscolher}
            accessibilityLabel={`Escolher ${candidato.nome}`}
            accessibilityHint={aoEscolher ? undefined : "Disponível em breve"}
          />
        </View>
      </View>
    </Card>
  );
}
