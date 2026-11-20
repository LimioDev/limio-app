import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";

import { useEscolhaDeFotos } from "../../../comum/hooks/useEscolhaDeFotos";
import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { MENSAGEM_FOTO_INVALIDA, type FotoEscolhida } from "../../../comum/tipos/foto";
import { useRegistrarDenunciaMutation } from "../servico/denuncia.queries";
import {
  MOTIVOS_DENUNCIA,
  rotuloMotivoDenuncia,
  type MotivoDenuncia,
} from "../tipos/denuncia.enums";
import { AlvoDenunciaSchema, DESCRICAO_DENUNCIA_MAX } from "../tipos/denuncia.types";

/** Mesmo texto do `ALVO_NAO_ACESSIVEL` da API. */
const MENSAGEM_ALVO_NAO_ACESSIVEL = "Não é possível denunciar este conteúdo.";

const MOTIVO_PERMISSAO = {
  camera: "Para fotografar a comprovação",
  galeria: "Para anexar uma foto de comprovação",
};

/**
 * Parâmetros da rota `denuncia`: o alvo e o texto do card, montados pela tela
 * de onde o usuário chegou (perfil, serviço, validação ou chat).
 */
// `type`, não `interface`: o `useLocalSearchParams` exige assinatura de índice.
export type ParametrosDenuncia = {
  denunciadoId?: string;
  anuncioId?: string;
  candidaturaId?: string;
  mensagemId?: string;
  /** "Limpeza pós-obra do apartamento" ou o nome da pessoa. */
  titulo?: string;
  /** "Concluído em 31/08 · com Marcos V.". */
  detalhe?: string;
};

export interface MotivoExibido {
  valor: MotivoDenuncia;
  rotulo: string;
}

const MOTIVOS: MotivoExibido[] = MOTIVOS_DENUNCIA.map((valor) => ({
  valor,
  rotulo: rotuloMotivoDenuncia(valor),
}));

/**
 * Tela 46 "Abrir denúncia" (ETI-115). O alvo vem da tela anterior; sucesso e
 * `ALVO_NAO_ACESSIVEL` avisam e voltam pra ela. A denúncia não estorna nem
 * muda o serviço, então nada é recarregado.
 */
export function useDenunciaViewModel({
  denunciadoId,
  anuncioId,
  candidaturaId,
  mensagemId,
  titulo,
  detalhe,
}: ParametrosDenuncia) {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const registrar = useRegistrarDenunciaMutation();

  const [motivo, setMotivo] = useState<MotivoDenuncia | null>(null);
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<FotoEscolhida | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const alvo = AlvoDenunciaSchema.safeParse({
    denunciadoId: denunciadoId || undefined,
    anuncioId: anuncioId || undefined,
    candidaturaId: candidaturaId || undefined,
    mensagemId: mensagemId || undefined,
  });

  // Trava síncrona do "Enviar denúncia": `isPending` só muda no próximo
  // render, e um toque duplo registraria duas denúncias.
  const enviandoRef = useRef(false);

  // A tela já saiu: o fim do envio não navega de novo, senão tiraria também
  // a tela de onde o usuário veio.
  const encerrada = useRef(false);
  useEffect(() => {
    encerrada.current = false;
    return () => {
      encerrada.current = true;
    };
  }, []);

  const voltar = () => {
    if (encerrada.current) {
      return;
    }
    encerrada.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const sairComAviso = (mensagem: string) => {
    mostrarToast(mensagem, TipoToast.ERRO);
    voltar();
  };

  // Rota sem alvo (link quebrado): mesma saída do `ALVO_NAO_ACESSIVEL`.
  const semAlvo = !alvo.success;
  useEffect(() => {
    if (semAlvo) {
      sairComAviso(MENSAGEM_ALVO_NAO_ACESSIVEL);
    }
    // Só a chegada sem alvo dispara; `sairComAviso` não muda o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semAlvo]);

  const enviando = registrar.isPending;

  // Durante o envio o voltar do Android não fecha a tela: o resultado ainda
  // decide se ela fica (erro) ou sai (sucesso).
  useEffect(() => {
    if (!enviando) {
      return;
    }
    const assinatura = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => assinatura.remove();
  }, [enviando]);

  // Uma foto só: a nova substitui a anterior.
  const escolhaDeFoto = useEscolhaDeFotos({
    vagas: 1,
    aoEscolher: ([escolhida]) => {
      if (!escolhida) {
        return;
      }
      setFoto(escolhida);
      setErroFoto(escolhida.erro);
    },
    motivoPermissao: MOTIVO_PERMISSAO,
  });

  const descricaoPreenchida = descricao.trim().length > 0;
  // A API exige a descrição (ETI-114), além do motivo. Foto recusada no
  // preparo ou pela API trava o envio até ser trocada ou removida.
  const podeEnviar =
    motivo !== null &&
    descricaoPreenchida &&
    erroFoto === null &&
    !escolhaDeFoto.preparandoFotos &&
    !semAlvo;

  const aoEnviar = async () => {
    if (
      !podeEnviar ||
      motivo === null ||
      !alvo.success ||
      enviandoRef.current ||
      encerrada.current
    ) {
      return;
    }
    enviandoRef.current = true;
    setErroEnvio(null);
    try {
      const denuncia = await registrar.mutateAsync({
        alvo: alvo.data,
        request: { motivo, descricao },
        foto: foto?.arquivo ?? null,
      });
      // O toast aparece mesmo se a tela já saiu: a denúncia foi registrada.
      mostrarToast(`Denúncia nº ${denuncia.numero} enviada. Vamos analisar.`);
      voltar();
    } catch (falha) {
      if (encerrada.current) {
        return;
      }
      switch (erroApi(falha)?.codigo) {
        case CodigoErro.ALVO_NAO_ACESSIVEL:
          sairComAviso(mensagemErroApi(falha, MENSAGEM_ALVO_NAO_ACESSIVEL));
          return;
        case CodigoErro.FOTO_INVALIDA:
          setErroFoto(MENSAGEM_FOTO_INVALIDA);
          return;
        default:
          // VALIDACAO_FALHOU e sem rede: a mensagem da API já explica.
          setErroEnvio(
            mensagemErroApi(falha, "Não foi possível enviar a denúncia. Tente novamente."),
          );
      }
    } finally {
      enviandoRef.current = false;
    }
  };

  return {
    // Card do alvo.
    titulo: titulo ?? "",
    detalhe: detalhe ?? "",
    /** Só `denunciadoId`: o card mostra uma pessoa, não um serviço. */
    alvoEhPerfil: alvo.success && !anuncioId && !candidaturaId && !mensagemId,

    motivos: MOTIVOS,
    motivo,
    aoEscolherMotivo: (valor: MotivoDenuncia) => setMotivo(valor),

    descricao,
    aoMudarDescricao: (texto: string) => {
      setDescricao(texto);
      setErroEnvio(null);
    },
    descricaoMax: DESCRICAO_DENUNCIA_MAX,

    fotoUri: foto?.previewUri ?? null,
    erroFoto,
    preparandoFoto: escolhaDeFoto.preparandoFotos,
    aoAdicionarFoto: escolhaDeFoto.aoAdicionarFoto,
    aoRemoverFoto: () => {
      setFoto(null);
      setErroFoto(null);
    },
    folhaFotoVisivel: escolhaDeFoto.folhaFotoVisivel,
    aoTirarFoto: escolhaDeFoto.aoTirarFoto,
    aoEscolherDaGaleria: escolhaDeFoto.aoEscolherDaGaleria,
    aoFecharFolhaFoto: escolhaDeFoto.aoFecharFolhaFoto,

    podeEnviar,
    enviando,
    erroEnvio,
    aoEnviar: () => {
      void aoEnviar();
    },
    aoVoltar: () => {
      if (!enviando) {
        voltar();
      }
    },
  };
}

export type DenunciaViewModel = ReturnType<typeof useDenunciaViewModel>;
