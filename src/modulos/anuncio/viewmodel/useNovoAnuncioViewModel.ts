import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { prepararFoto } from "../../../comum/lib/foto";
import { TipoToast, useToast } from "../../../comum/store/toast";
import {
  useRascunhoAnuncio,
  type ErrosAnuncio,
  type FotoRascunho,
} from "../store/rascunhoAnuncio.store";
import { DESCRICAO_MAX, FOTOS_MAX, PassoUmSchema, TITULO_MAX } from "../tipos/anuncio.types";

const MENSAGEM_FALHA_GALERIA = "Não foi possível abrir suas fotos. Tente de novo.";
const MENSAGEM_FALHA_PREPARO = "Não foi possível ler essa imagem. Escolha outra.";

export interface FotoExibida {
  chave: string;
  uri: string;
  /** Motivo da recusa; a foto recusada não é enviada. */
  erro: string | null;
}

function avisarPermissaoNegada(): void {
  Alert.alert(
    "Sem acesso às fotos",
    "Para anexar fotos ao anúncio, permita que o LIMIO acesse suas fotos nos ajustes do aparelho.",
    [
      { text: "Agora não", style: "cancel" },
      { text: "Abrir ajustes", onPress: () => void Linking.openSettings() },
    ],
  );
}

let contadorChave = 0;

/** Prepara cada imagem escolhida (JPEG reduzido + conferência). A recusada volta com o motivo. */
async function prepararEscolhidas(imagens: ImagePicker.ImagePickerAsset[]): Promise<FotoRascunho[]> {
  const fotos: FotoRascunho[] = [];
  for (const imagem of imagens) {
    contadorChave += 1;
    const chave = `foto-${Date.now()}-${contadorChave}`;
    const preparo = await prepararFoto(imagem, `${chave}.jpg`).catch(() => null);
    fotos.push({
      chave,
      previewUri: imagem.uri,
      arquivo: preparo?.valido ? preparo.arquivo : null,
      erro: !preparo ? MENSAGEM_FALHA_PREPARO : preparo.valido ? null : preparo.mensagem,
    });
  }
  return fotos;
}

/** Tela 14 "Novo anúncio" (1 de 2): categoria, título, descrição e fotos. */
export function useNovoAnuncioViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const rascunho = useRascunhoAnuncio((estado) => estado.rascunho);
  const erros = useRascunhoAnuncio((estado) => estado.erros);
  const alterar = useRascunhoAnuncio((estado) => estado.alterar);
  const adicionarFotos = useRascunhoAnuncio((estado) => estado.adicionarFotos);
  const removerFoto = useRascunhoAnuncio((estado) => estado.removerFoto);
  const definirErros = useRascunhoAnuncio((estado) => estado.definirErros);
  const descartar = useRascunhoAnuncio((estado) => estado.descartar);

  // Trava desde o toque: a galeria e o preparo têm esperas em que um segundo toque passaria.
  const escolhendo = useRef(false);
  const [preparandoFotos, setPreparandoFotos] = useState(false);

  // Sair do fluxo (voltar daqui) descarta o rascunho. Ir pra 14a/15 não
  // desmonta esta tela, então o rascunho continua.
  useEffect(() => () => descartar(), [descartar]);

  const vagas = FOTOS_MAX - rascunho.fotos.length;

  const aoAdicionarFoto = async () => {
    if (escolhendo.current || vagas <= 0) {
      return;
    }
    escolhendo.current = true;
    try {
      // iOS com acesso "limitado" também vem `granted`. No web a chamada não faz nada.
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        avisarPermissaoNegada();
        return;
      }
      const escolha = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        selectionLimit: vagas,
        quality: 1,
      });
      if (escolha.canceled) {
        return;
      }
      setPreparandoFotos(true);
      // No Android o limite de seleção nem sempre é respeitado.
      adicionarFotos(await prepararEscolhidas(escolha.assets.slice(0, vagas)));
    } catch {
      mostrarToast(MENSAGEM_FALHA_GALERIA, TipoToast.ERRO);
    } finally {
      escolhendo.current = false;
      setPreparandoFotos(false);
    }
  };

  const aoContinuar = () => {
    const resultado = PassoUmSchema.safeParse({
      categoriaId: rascunho.categoria?.id,
      titulo: rascunho.titulo,
      descricao: rascunho.descricao,
    });
    const novosErros: ErrosAnuncio = {};
    if (!resultado.success) {
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] === "categoriaId" ? "categoria" : problema.path[0];
        if (campo === "categoria" || campo === "titulo" || campo === "descricao") {
          novosErros[campo] ??= problema.message;
        }
      }
    }
    if (rascunho.fotos.some((foto) => foto.erro)) {
      novosErros.fotos = "Remova as fotos recusadas para continuar.";
    }
    definirErros(novosErros);
    if (Object.keys(novosErros).length === 0) {
      router.push("/(app)/anuncio/novo/detalhes");
    }
  };

  const fotos: FotoExibida[] = rascunho.fotos.map((foto) => ({
    chave: foto.chave,
    uri: foto.previewUri,
    erro: foto.erro,
  }));

  return {
    categoria: rascunho.categoria?.nome ?? null,
    aoTrocarCategoria: () => router.push("/(app)/anuncio/novo/categoria"),
    titulo: rascunho.titulo,
    aoMudarTitulo: (texto: string) => alterar("titulo", texto),
    tituloMax: TITULO_MAX,
    descricao: rascunho.descricao,
    aoMudarDescricao: (texto: string) => alterar("descricao", texto),
    descricaoMax: DESCRICAO_MAX,
    fotos,
    fotosMax: FOTOS_MAX,
    podeAdicionarFoto: vagas > 0 && !preparandoFotos,
    preparandoFotos,
    aoAdicionarFoto: () => void aoAdicionarFoto(),
    aoRemoverFoto: removerFoto,
    erros,
    podeContinuar: !preparandoFotos,
    aoContinuar,
    aoVoltar: () => router.back(),
  };
}
