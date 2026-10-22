import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Alert } from "react-native";

import { erroApi } from "../../../comum/lib/erros";
import { useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { prepararFotoPerfil } from "../servico/fotoPerfil.helpers";
import {
  useEnviarFotoPerfilMutation,
  useFotoPerfilQuery,
} from "../servico/fotoPerfil.queries";
import { MENSAGEM_FOTO_INVALIDA } from "../tipos/fotoPerfil.types";

const MENSAGEM_ENVIADA = "Foto de perfil atualizada.";
const MENSAGEM_FALHA_PREPARO = "Não foi possível ler essa imagem. Escolha outra.";
const MENSAGEM_FALHA_ENVIO = "Não foi possível enviar a foto. Tente de novo.";
const MENSAGEM_ARMAZENAMENTO =
  "O envio de fotos está fora do ar agora. Tente de novo em instantes.";

/** Mensagem do erro do envio. A foto anterior continua: o cache só muda no sucesso. */
function mensagemErroEnvio(erro: unknown): string {
  const resposta = erroApi(erro);
  switch (resposta?.codigo) {
    case CodigoErro.FOTO_INVALIDA:
    case CodigoErro.ARQUIVO_GRANDE_DEMAIS:
      return MENSAGEM_FOTO_INVALIDA;
    case CodigoErro.ARMAZENAMENTO_INDISPONIVEL:
      return MENSAGEM_ARMAZENAMENTO;
    default:
      return resposta?.mensagem ?? MENSAGEM_FALHA_ENVIO;
  }
}

function avisarPermissaoNegada(): void {
  Alert.alert(
    "Sem acesso às fotos",
    "Para trocar sua foto de perfil, permita que o LIMIO acesse suas fotos nos ajustes do aparelho.",
    [
      { text: "Agora não", style: "cancel" },
      { text: "Abrir ajustes", onPress: () => void Linking.openSettings() },
    ],
  );
}

/**
 * Foto de perfil em "Meu perfil" (tela 08): toque no avatar → permissão →
 * galeria (recorte quadrado) → preparo e conferência → `PUT /conta/foto-perfil`.
 */
export function useTrocarFotoPerfilViewModel() {
  const foto = useFotoPerfilQuery();
  const envio = useEnviarFotoPerfilMutation();
  const mostrarToast = useToast((estado) => estado.mostrar);
  // Cobre o preparo da imagem também, não só a requisição: o carregando
  // aparece assim que a galeria fecha.
  const [preparando, setPreparando] = useState(false);
  const enviandoFoto = preparando || envio.isPending;

  const aoTrocarFoto = async () => {
    if (enviandoFoto) {
      return;
    }

    // iOS com acesso "limitado" também vem `granted`. No web a chamada não faz nada.
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      avisarPermissaoNegada();
      return;
    }

    const escolha = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    const imagem = escolha.assets?.[0];
    if (escolha.canceled || !imagem) {
      return;
    }

    setPreparando(true);
    try {
      const preparo = await prepararFotoPerfil(imagem).catch(() => null);
      if (!preparo) {
        mostrarToast(MENSAGEM_FALHA_PREPARO);
        return;
      }
      if (!preparo.valido) {
        mostrarToast(preparo.mensagem);
        return;
      }
      await envio.mutateAsync(preparo.arquivo);
      mostrarToast(MENSAGEM_ENVIADA);
    } catch (erro) {
      mostrarToast(mensagemErroEnvio(erro));
    } finally {
      setPreparando(false);
    }
  };

  return {
    fotoUrl: foto.data?.url ?? null,
    enviandoFoto,
    aoTrocarFoto: () => void aoTrocarFoto(),
    aoAtualizarFoto: () => void foto.refetch(),
  };
}
