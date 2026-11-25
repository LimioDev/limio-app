import { Stack } from "expo-router";

import { useSessao } from "../../src/comum/store/sessao";
import { PapelUsuario } from "../../src/comum/tipos/papel";
import { BannerNotificacaoView } from "../../src/modulos/notificacao/view/BannerNotificacaoView";
import { usePushNotificacoesViewModel } from "../../src/modulos/notificacao/viewmodel/usePushNotificacoesViewModel";

export default function AppLayout() {
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  // Push (ETI-113): este layout só monta com sessão, então registra o aparelho
  // depois do login e a cada abertura do app já logado.
  const push = usePushNotificacoesViewModel();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Só o dashboard do papel ativo fica acessível; trocar o papel redireciona.
            Sessão autenticada sempre tem papel do app (`ADMIN` não abre sessão),
            então nenhum papel cai num dashboard por exclusão. */}
        <Stack.Protected guard={papelAtivo === PapelUsuario.EMPREGADOR}>
          <Stack.Screen name="(contratante)" />
          {/* Criar e acompanhar o próprio anúncio (telas 14 a 16). */}
          <Stack.Screen name="anuncio" />
          {/* Telas 23/24: folha por cima da tela 18 ou do chat, que continuam
              aparecendo atrás. Fica neste nível pra abrir de qualquer uma das duas. */}
          <Stack.Screen
            name="escolher-prestador"
            options={{ presentation: "transparentModal", animation: "fade" }}
          />
        </Stack.Protected>
        <Stack.Protected guard={papelAtivo === PapelUsuario.PRESTADOR}>
          <Stack.Screen name="(prestador)" />
          {/* Tela 33 "Cota do mês": fora das abas, com voltar (ETI-80). */}
          <Stack.Screen name="cota" />
          {/* Telas 34 "Assinatura" e 35 "Assinatura GOLD" (ETI-82): só o
              Prestador assina; a API recusa os outros papéis. */}
          <Stack.Screen name="conta/assinatura" />
          <Stack.Screen name="conta/assinatura-gold" />
          {/* Cadastrar ou trocar o cartão do GOLD (ETI-84), aberta pelas telas 34 e 35. */}
          <Stack.Screen name="conta/cartao" />
        </Stack.Protected>
        <Stack.Screen name="trocar-papel" options={{ presentation: "modal" }} />
      </Stack>
      <BannerNotificacaoView {...push} />
    </>
  );
}
