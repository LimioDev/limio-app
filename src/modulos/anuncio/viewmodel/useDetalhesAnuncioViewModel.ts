import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";

import { deDataHoraLocal } from "../../../comum/lib/datas";
import {
  CAMPO_ENDERECO_DA_API,
  linhaLogradouro,
  paraCamposRequest,
} from "../../../comum/lib/endereco";
import { erroApi, errosPorCampo, mensagemErroApi } from "../../../comum/lib/erros";
import { chavesCategoria } from "../../../comum/servico/categoria.queries";
import { useEnderecosQuery } from "../../../comum/servico/endereco.queries";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { MENSAGEM_FOTO_INVALIDA } from "../../../comum/tipos/foto";
import {
  chavesAnuncio,
  useAnexarFotoAnuncioMutation,
  useCriarAnuncioMutation,
} from "../servico/anuncio.queries";
import {
  useRascunhoAnuncio,
  type EnderecoEscolhido,
  type ErrosAnuncio,
  type RascunhoAnuncio,
} from "../store/rascunhoAnuncio.store";
import {
  PassoDoisSchema,
  PassoUmSchema,
  TAMANHO_LOCAL_MAX,
  type AnuncioRequest,
} from "../tipos/anuncio.types";

const CHAVE_AVULSO = "avulso";

type CampoErro = keyof ErrosAnuncio;

/** Campos do passo 1: erro num deles leva de volta pra tela 14. */
const CAMPOS_PASSO_UM: readonly CampoErro[] = ["categoria", "titulo", "descricao", "fotos"];

/** Nome do campo no `AnuncioRequest` da API → campo das telas 14/15. */
const CAMPO_DA_API: Record<string, CampoErro> = {
  categoriaId: "categoria",
  titulo: "titulo",
  descricao: "descricao",
  dataHoraPretendida: "data",
  enderecoSalvoId: "endereco",
  enderecoAvulso: "endereco",
  // Campo do avulso ("enderecoAvulso.cep"): o erro aparece no endereço.
  ...Object.fromEntries(
    Object.keys(CAMPO_ENDERECO_DA_API).map((campo) => [`enderecoAvulso.${campo}`, "endereco"]),
  ),
  tamanhoLocal: "tamanhoLocal",
  numeroPessoas: "numeroPessoas",
  observacoes: "observacoes",
};

export interface OpcaoEndereco {
  chave: string;
  titulo: string;
  /** "R. Cardeal Arcoverde, 1424 · Pinheiros". */
  linha: string;
  selecionado: boolean;
}

function mensagemFalhaFoto(erro: unknown): string {
  const resposta = erroApi(erro);
  switch (resposta?.codigo) {
    case CodigoErro.FOTO_INVALIDA:
    case CodigoErro.ARQUIVO_GRANDE_DEMAIS:
      return MENSAGEM_FOTO_INVALIDA;
    default:
      return resposta?.mensagem ?? "Não foi possível enviar a foto.";
  }
}

function paraRequest(
  rascunho: RascunhoAnuncio,
  endereco: EnderecoEscolhido,
  instante: Date,
): AnuncioRequest {
  return {
    categoriaId: rascunho.categoria!.id,
    titulo: rascunho.titulo.trim(),
    descricao: rascunho.descricao.trim(),
    dataHoraPretendida: instante.toISOString(),
    enderecoSalvoId: endereco.tipo === "salvo" ? endereco.id : null,
    enderecoAvulso: endereco.tipo === "avulso" ? paraCamposRequest(endereco.campos) : null,
    tamanhoLocal: rascunho.tamanhoLocal.trim() || null,
    numeroPessoas: rascunho.numeroPessoas.trim() ? Number(rascunho.numeroPessoas) : null,
    observacoes: rascunho.observacoes.trim() || null,
  };
}

/**
 * Tela 15 "Novo anúncio" (2 de 2): data e hora, endereço, opcionais e
 * "Publicar no mural". Publicar cria o anúncio e depois manda as fotos, uma
 * por vez; com o anúncio criado, foto recusada não desfaz a publicação.
 */
export function useDetalhesAnuncioViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const rascunho = useRascunhoAnuncio((estado) => estado.rascunho);
  const erros = useRascunhoAnuncio((estado) => estado.erros);
  const alterar = useRascunhoAnuncio((estado) => estado.alterar);
  const definirErros = useRascunhoAnuncio((estado) => estado.definirErros);
  const descartar = useRascunhoAnuncio((estado) => estado.descartar);
  const enderecos = useEnderecosQuery();
  const criar = useCriarAnuncioMutation();
  const anexarFoto = useAnexarFotoAnuncioMutation();

  // Trava desde o toque: criar + fotos são várias esperas.
  const emAndamento = useRef(false);
  const [publicando, setPublicando] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [avisoContatos, setAvisoContatos] = useState<string | null>(null);

  const salvos = enderecos.data ?? [];
  const padrao = salvos.find((e) => e.isPadrao);
  // Sem escolha ainda, o padrão já vem marcado.
  const escolhido: EnderecoEscolhido | null =
    rascunho.endereco ?? (padrao ? { tipo: "salvo", id: padrao.id } : null);

  const opcoes: OpcaoEndereco[] = salvos.map((e) => ({
    chave: e.id,
    titulo: e.apelido,
    linha: `${linhaLogradouro(e)} · ${e.bairroRegiao}`,
    selecionado: escolhido?.tipo === "salvo" && escolhido.id === e.id,
  }));
  if (rascunho.avulso) {
    opcoes.push({
      chave: CHAVE_AVULSO,
      titulo: rascunho.avulso.apelido || "Outro endereço",
      linha: `${linhaLogradouro({ ...rascunho.avulso, complemento: rascunho.avulso.complemento || null })} · ${rascunho.avulso.bairro}`,
      selecionado: escolhido?.tipo === "avulso",
    });
  }

  /** Aplica os erros; se algum é do passo 1, volta pra tela 14, onde eles aparecem. */
  const mostrarErros = (novos: ErrosAnuncio) => {
    definirErros(novos);
    if (CAMPOS_PASSO_UM.some((campo) => novos[campo])) {
      router.back();
    }
  };

  const tratarErroCriacao = (erro: unknown) => {
    const resposta = erroApi(erro);
    switch (resposta?.codigo) {
      // `DADOS_INVALIDOS` é o nome sugerido no card; o back pode usar o `VALIDACAO_FALHOU` que já existe.
      case CodigoErro.DADOS_INVALIDOS:
      case CodigoErro.VALIDACAO_FALHOU: {
        const porCampo = errosPorCampo(resposta.mensagem, CAMPO_DA_API);
        if (Object.keys(porCampo).length > 0) {
          mostrarErros(porCampo);
          return;
        }
        setErroServidor(resposta.mensagem);
        return;
      }
      case CodigoErro.DATA_NO_PASSADO:
        definirErros({ data: resposta.mensagem });
        return;
      case CodigoErro.CATEGORIA_INVALIDA:
        // A categoria foi desativada: recarrega a lista pra uma nova escolha.
        void queryClient.invalidateQueries({ queryKey: chavesCategoria.lista });
        mostrarErros({ categoria: "Essa categoria não está mais disponível. Escolha outra." });
        return;
      case CodigoErro.CONTATOS_NAO_CONFIRMADOS:
        setAvisoContatos(resposta.mensagem);
        return;
      case CodigoErro.ENDERECO_NAO_ENCONTRADO:
        // Removido em outro aparelho: a lista na tela está velha.
        void enderecos.refetch();
        alterar("endereco", null);
        definirErros({ endereco: resposta.mensagem });
        return;
      case CodigoErro.ENDERECO_NAO_LOCALIZADO:
      case CodigoErro.GEOCODIFICACAO_INDISPONIVEL:
      case CodigoErro.MUNICIPIO_NAO_ENCONTRADO:
        definirErros({ endereco: resposta.mensagem });
        return;
      default:
        // PAPEL_INVALIDO, ACESSO_NEGADO e o resto: quem decide é a API, a mensagem dela diz o porquê.
        setErroServidor(
          mensagemErroApi(erro, "Não foi possível publicar o anúncio. Tente novamente."),
        );
    }
  };

  /** Valida os dois passos. Devolve o instante pretendido, ou `null` com os erros já na tela. */
  const validar = (): { instante: Date; endereco: EnderecoEscolhido } | null => {
    const passoUm = PassoUmSchema.safeParse({
      categoriaId: rascunho.categoria?.id,
      titulo: rascunho.titulo,
      descricao: rascunho.descricao,
    });
    if (!passoUm.success) {
      const novos: ErrosAnuncio = {};
      for (const problema of passoUm.error.issues) {
        const campo = problema.path[0] === "categoriaId" ? "categoria" : problema.path[0];
        if (campo === "categoria" || campo === "titulo" || campo === "descricao") {
          novos[campo] ??= problema.message;
        }
      }
      mostrarErros(novos);
      return null;
    }

    const novos: ErrosAnuncio = {};
    const passoDois = PassoDoisSchema.safeParse(rascunho);
    if (!passoDois.success) {
      for (const problema of passoDois.error.issues) {
        const campo = problema.path[0];
        if (
          campo === "data" ||
          campo === "hora" ||
          campo === "tamanhoLocal" ||
          campo === "numeroPessoas"
        ) {
          novos[campo] ??= problema.message;
        }
      }
    }
    let instante: Date | null = null;
    if (!novos.data && !novos.hora) {
      instante = deDataHoraLocal(rascunho.data, rascunho.hora);
      if (!instante) {
        novos.data = "Essa data ou hora não existe";
      } else if (instante.getTime() <= Date.now()) {
        novos.data = "Escolha uma data e hora no futuro";
      }
    }
    if (!escolhido) {
      novos.endereco = "Escolha o endereço do serviço";
    }
    definirErros(novos);
    return Object.keys(novos).length === 0 && instante && escolhido
      ? { instante, endereco: escolhido }
      : null;
  };

  const aoPublicar = async () => {
    if (emAndamento.current) {
      return;
    }
    setErroServidor(null);
    setAvisoContatos(null);
    const valido = validar();
    if (!valido) {
      return;
    }

    emAndamento.current = true;
    setPublicando(true);
    try {
      let anuncioId: string;
      try {
        ({ id: anuncioId } = await criar.mutateAsync(
          paraRequest(rascunho, valido.endereco, valido.instante),
        ));
      } catch (erro) {
        tratarErroCriacao(erro);
        return;
      }

      const falhas: string[] = [];
      for (const foto of rascunho.fotos) {
        if (!foto.arquivo) {
          continue;
        }
        try {
          await anexarFoto.mutateAsync({ anuncioId, arquivo: foto.arquivo });
        } catch (erro) {
          falhas.push(mensagemFalhaFoto(erro));
        }
      }

      // A tela 13 passa a mostrar o anúncio novo.
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
      if (falhas.length === 0) {
        mostrarToast("Anúncio publicado no mural");
      } else {
        const quantas =
          falhas.length === 1 ? "1 foto não foi enviada" : `${falhas.length} fotos não foram enviadas`;
        mostrarToast(`Anúncio publicado, mas ${quantas}. ${falhas[0]}`, TipoToast.ERRO);
      }

      // Tela 16 no lugar do fluxo de criação: voltar dela leva ao Início.
      router.dismissAll();
      router.replace({ pathname: "/(app)/anuncio/[id]", params: { id: anuncioId } });
      descartar();
    } finally {
      emAndamento.current = false;
      setPublicando(false);
    }
  };

  return {
    data: rascunho.data,
    aoMudarData: (texto: string) => alterar("data", texto),
    hora: rascunho.hora,
    aoMudarHora: (texto: string) => alterar("hora", texto),
    carregandoEnderecos: enderecos.isPending,
    erroEnderecos: enderecos.isError
      ? mensagemErroApi(enderecos.error, "Não foi possível carregar seus endereços.")
      : null,
    aoRecarregarEnderecos: () => {
      void enderecos.refetch();
    },
    opcoesEndereco: opcoes,
    aoEscolherEndereco: (chave: string) => {
      if (chave === CHAVE_AVULSO) {
        if (rascunho.avulso) {
          alterar("endereco", { tipo: "avulso", campos: rascunho.avulso });
        }
        return;
      }
      alterar("endereco", { tipo: "salvo", id: chave });
    },
    temAvulso: rascunho.avulso !== null,
    aoUsarOutroEndereco: () => router.push("/(app)/anuncio/novo/endereco"),
    tamanhoLocal: rascunho.tamanhoLocal,
    aoMudarTamanhoLocal: (texto: string) => alterar("tamanhoLocal", texto),
    tamanhoLocalMax: TAMANHO_LOCAL_MAX,
    numeroPessoas: rascunho.numeroPessoas,
    aoMudarNumeroPessoas: (texto: string) => alterar("numeroPessoas", texto.replace(/\D/g, "")),
    observacoes: rascunho.observacoes,
    aoMudarObservacoes: (texto: string) => alterar("observacoes", texto),
    erros,
    erroServidor,
    avisoContatos,
    aoConfirmarContatos: () => router.push("/(app)/conta/dados-contato"),
    publicando,
    aoPublicar: () => void aoPublicar(),
    aoVoltar: () => router.back(),
  };
}
