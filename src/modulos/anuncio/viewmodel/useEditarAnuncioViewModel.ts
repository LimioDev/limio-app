import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { deDataHoraLocal, formatarDataHora } from "../../../comum/lib/datas";
import { erroApi, errosPorCampo, mensagemErroApi } from "../../../comum/lib/erros";
import { chavesCategoria } from "../../../comum/servico/categoria.queries";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { mensagemFalhaFoto } from "../servico/anuncio.helpers";
import {
  chavesAnuncio,
  useAnexarFotoAnuncioMutation,
  useAnuncioQuery,
  useEditarAnuncioMutation,
  useRemoverFotoAnuncioMutation,
} from "../servico/anuncio.queries";
import {
  useEdicaoAnuncio,
  type ErrosEdicao,
  type FormularioEdicao,
} from "../store/edicaoAnuncio.store";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import {
  DESCRICAO_MAX,
  FOTOS_MAX,
  PassoDoisSchema,
  PassoUmSchema,
  TAMANHO_LOCAL_MAX,
  TITULO_MAX,
  TITULO_MIN,
  type AnuncioDetalheResponse,
  type EditarAnuncioRequest,
} from "../tipos/anuncio.types";
import type { FotoExibida } from "./useNovoAnuncioViewModel";
import { useEscolhaDeFotos } from "./useEscolhaDeFotos";

type CampoErro = keyof ErrosEdicao;

/** Nome do campo no `EditarAnuncioRequest` da API → campo da tela 16a. */
const CAMPO_DA_API: Record<string, CampoErro> = {
  categoriaId: "categoria",
  titulo: "titulo",
  descricao: "descricao",
  dataHoraPretendida: "data",
  tamanhoLocal: "tamanhoLocal",
  numeroPessoas: "numeroPessoas",
  observacoes: "observacoes",
};

const CAMPOS_PASSO_DOIS = ["data", "hora", "tamanhoLocal", "numeroPessoas"] as const;

/** O anúncio como veio da API → formulário da tela, com data e hora no fuso do sistema. */
function paraFormulario(anuncio: AnuncioDetalheResponse): FormularioEdicao {
  return {
    categoria: anuncio.categoria,
    titulo: anuncio.titulo,
    descricao: anuncio.descricao,
    fotos: anuncio.fotos.map((foto) => ({ tipo: "salva", chave: foto.id, uri: foto.url })),
    data: formatarDataHora(anuncio.dataHoraPretendida, "dd/MM/yyyy"),
    hora: formatarDataHora(anuncio.dataHoraPretendida, "HH:mm"),
    tamanhoLocal: anuncio.tamanhoLocal ?? "",
    numeroPessoas: anuncio.numeroPessoas !== null ? String(anuncio.numeroPessoas) : "",
    observacoes: anuncio.observacoes ?? "",
  };
}

/** O `PUT` substitui tudo: opcional vazio vai `null` e é apagado. */
function paraRequest(formulario: FormularioEdicao, instante: Date): EditarAnuncioRequest {
  return {
    categoriaId: formulario.categoria!.id,
    titulo: formulario.titulo.trim(),
    descricao: formulario.descricao.trim(),
    dataHoraPretendida: instante.toISOString(),
    tamanhoLocal: formulario.tamanhoLocal.trim() || null,
    numeroPessoas: formulario.numeroPessoas.trim() ? Number(formulario.numeroPessoas) : null,
    observacoes: formulario.observacoes.trim() || null,
  };
}

function naoEncontrado(erro: unknown): boolean {
  return (
    erroApi(erro)?.codigo === CodigoErro.ANUNCIO_NAO_ENCONTRADO ||
    (isAxiosError(erro) && erro.response?.status === 404)
  );
}

/**
 * Tela 16a "Editar anúncio" (ETI-62): os campos da criação já preenchidos,
 * menos o endereço, que a API não deixa trocar. Se ainda dá pra editar quem
 * decide é a API. "Salvar alterações" edita o anúncio e só depois mexe nas
 * fotos (tira as removidas, que liberam vaga, e manda as novas, uma por vez);
 * com o anúncio já salvo, foto que falhar não desfaz a edição.
 */
export function useEditarAnuncioViewModel(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useAnuncioQuery(id);
  const editar = useEditarAnuncioMutation();
  const removerFotoSalva = useRemoverFotoAnuncioMutation();
  const anexarFoto = useAnexarFotoAnuncioMutation();

  const anuncioDoFormulario = useEdicaoAnuncio((estado) => estado.anuncioId);
  const formulario = useEdicaoAnuncio((estado) => estado.formulario);
  const fotosOriginais = useEdicaoAnuncio((estado) => estado.fotosOriginais);
  const erros = useEdicaoAnuncio((estado) => estado.erros);
  const iniciar = useEdicaoAnuncio((estado) => estado.iniciar);
  const alterar = useEdicaoAnuncio((estado) => estado.alterar);
  const adicionarFotos = useEdicaoAnuncio((estado) => estado.adicionarFotos);
  const removerFoto = useEdicaoAnuncio((estado) => estado.removerFoto);
  const definirErros = useEdicaoAnuncio((estado) => estado.definirErros);
  const descartar = useEdicaoAnuncio((estado) => estado.descartar);

  // Trava desde o toque: editar + fotos são várias esperas.
  const emAndamento = useRef(false);
  const [salvando, setSalvando] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  // Preenche uma vez, com o anúncio da tela 16. A nova consulta que a query
  // faz ao abrir não apaga o que o usuário já digitou.
  useEffect(() => {
    if (query.data && anuncioDoFormulario !== id) {
      iniciar(id, paraFormulario(query.data));
    }
  }, [query.data, anuncioDoFormulario, id, iniciar]);

  // O voltar segue ativo durante o "Salvando...": se a 16a já saiu quando o
  // salvar termina, navegar de novo tiraria a tela 16 também.
  const montada = useRef(true);
  // Sair da tela descarta. Ir pra 14a não desmonta esta tela.
  useEffect(() => {
    montada.current = true;
    return () => {
      montada.current = false;
      descartar();
    };
  }, [descartar]);

  const pronto = anuncioDoFormulario === id;
  const vagas = FOTOS_MAX - formulario.fotos.length;
  const escolhaDeFotos = useEscolhaDeFotos({ vagas, aoEscolher: adicionarFotos });

  const voltarPraTela16 = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({ pathname: "/(app)/anuncio/[id]", params: { id } });

  /** Fim do salvar: só navega se o usuário ainda está na 16a. */
  const sairSeAindaAberta = () => {
    if (montada.current) {
      voltarPraTela16();
    }
  };

  /**
   * `409 ANUNCIO_ESTADO_INVALIDO`: alguém foi escolhido (ou o anúncio foi
   * cancelado em outro aparelho) antes de salvar. Volta pra tela 16, que
   * mostra a situação (igual ao ETI-70).
   * TODO(ETI-87): no combinado, abrir a tela 25 do serviço, onde fica o "Reagendar".
   */
  const aoAnuncioFechado = async () => {
    void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });
    const { data } = await query.refetch();
    const encerrado =
      data?.status === StatusAnuncio.ENCERRADO || data?.status === StatusAnuncio.CONCLUIDO;
    mostrarToast(
      encerrado ? "Este anúncio não pode mais ser editado" : "Este anúncio já foi combinado",
      TipoToast.ERRO,
    );
    sairSeAindaAberta();
  };

  const tratarErroEdicao = async (erro: unknown) => {
    const resposta = erroApi(erro);
    switch (resposta?.codigo) {
      // `DADOS_INVALIDOS` é o nome do card; a API usa o `VALIDACAO_FALHOU`.
      case CodigoErro.DADOS_INVALIDOS:
      case CodigoErro.VALIDACAO_FALHOU: {
        const porCampo = errosPorCampo(resposta.mensagem, CAMPO_DA_API);
        if (Object.keys(porCampo).length > 0) {
          definirErros(porCampo);
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
        definirErros({ categoria: "Essa categoria não está mais disponível. Escolha outra." });
        return;
      case CodigoErro.ANUNCIO_ESTADO_INVALIDO:
        await aoAnuncioFechado();
        return;
      default:
        setErroServidor(
          mensagemErroApi(erro, "Não foi possível salvar as alterações. Tente novamente."),
        );
    }
  };

  /** Valida como na criação. Devolve o instante pretendido, ou `null` com os erros já na tela. */
  const validar = (): Date | null => {
    const novos: ErrosEdicao = {};
    const passoUm = PassoUmSchema.safeParse({
      categoriaId: formulario.categoria?.id,
      titulo: formulario.titulo,
      descricao: formulario.descricao,
    });
    if (!passoUm.success) {
      for (const problema of passoUm.error.issues) {
        const campo = problema.path[0] === "categoriaId" ? "categoria" : problema.path[0];
        if (campo === "categoria" || campo === "titulo" || campo === "descricao") {
          novos[campo] ??= problema.message;
        }
      }
    }
    const passoDois = PassoDoisSchema.safeParse(formulario);
    if (!passoDois.success) {
      for (const problema of passoDois.error.issues) {
        const campo = CAMPOS_PASSO_DOIS.find((c) => c === problema.path[0]);
        if (campo) {
          novos[campo] ??= problema.message;
        }
      }
    }
    let instante: Date | null = null;
    if (!novos.data && !novos.hora) {
      instante = deDataHoraLocal(formulario.data, formulario.hora);
      if (!instante) {
        novos.data = "Essa data ou hora não existe";
      } else if (instante.getTime() <= Date.now()) {
        novos.data = "Escolha uma data e hora no futuro";
      }
    }
    if (formulario.fotos.some((foto) => foto.tipo === "nova" && foto.erro)) {
      novos.fotos = "Remova as fotos recusadas para salvar.";
    }
    definirErros(novos);
    return Object.keys(novos).length === 0 ? instante : null;
  };

  /** Tira as fotos removidas e manda as novas. Devolve o motivo de cada uma que falhou. */
  const salvarFotos = async (): Promise<string[]> => {
    const falhas: string[] = [];
    const mantidas = new Set(
      formulario.fotos.filter((foto) => foto.tipo === "salva").map((foto) => foto.chave),
    );
    for (const fotoId of fotosOriginais) {
      if (mantidas.has(fotoId)) {
        continue;
      }
      try {
        await removerFotoSalva.mutateAsync({ anuncioId: id, fotoId });
      } catch (erro) {
        // Já tinha saído (outro aparelho): é o que o usuário queria.
        if (erroApi(erro)?.codigo !== CodigoErro.ENTIDADE_NAO_ENCONTRADA) {
          falhas.push(mensagemErroApi(erro, "Não foi possível remover a foto."));
        }
      }
    }
    for (const foto of formulario.fotos) {
      if (foto.tipo !== "nova" || !foto.arquivo) {
        continue;
      }
      try {
        await anexarFoto.mutateAsync({ anuncioId: id, arquivo: foto.arquivo });
      } catch (erro) {
        falhas.push(mensagemFalhaFoto(erro));
      }
    }
    return falhas;
  };

  const aoSalvar = async () => {
    if (emAndamento.current) {
      return;
    }
    setErroServidor(null);
    const instante = validar();
    if (!instante) {
      return;
    }

    emAndamento.current = true;
    setSalvando(true);
    try {
      try {
        await editar.mutateAsync({ id, request: paraRequest(formulario, instante) });
      } catch (erro) {
        await tratarErroEdicao(erro);
        return;
      }

      const mexeuNasFotos =
        formulario.fotos.some((foto) => foto.tipo === "nova") ||
        fotosOriginais.length !==
          formulario.fotos.filter((foto) => foto.tipo === "salva").length;
      const falhas = mexeuNasFotos ? await salvarFotos() : [];

      // A resposta do `PUT` já está no cache; as fotos mudaram depois dela.
      if (mexeuNasFotos) {
        void queryClient.invalidateQueries({ queryKey: chavesAnuncio.detalhe(id) });
      }
      // O Início mostra a descrição e a data do anúncio.
      void queryClient.invalidateQueries({ queryKey: chavesAnuncio.painelEmpregador });

      if (falhas.length === 0) {
        mostrarToast("Anúncio atualizado");
      } else {
        const quantas =
          falhas.length === 1
            ? "1 foto não foi atualizada"
            : `${falhas.length} fotos não foram atualizadas`;
        mostrarToast(`Anúncio atualizado, mas ${quantas}. ${falhas[0]}`, TipoToast.ERRO);
      }
      // O toast aparece mesmo se ele já saiu: a edição foi salva.
      sairSeAindaAberta();
    } finally {
      emAndamento.current = false;
      setSalvando(false);
    }
  };

  let erro: string | null = null;
  if (!pronto && query.isError && !query.data) {
    erro = naoEncontrado(query.error)
      ? "Este anúncio não existe ou não é seu."
      : mensagemErroApi(query.error, "Não foi possível carregar o anúncio.");
  }

  const fotos: FotoExibida[] = formulario.fotos.map((foto) =>
    foto.tipo === "salva"
      ? { chave: foto.chave, uri: foto.uri, erro: null }
      : { chave: foto.chave, uri: foto.previewUri, erro: foto.erro },
  );

  return {
    carregando: !pronto && !erro,
    erro,
    aoTentarDeNovo: () => {
      void query.refetch();
    },
    categoria: formulario.categoria?.nome ?? null,
    aoTrocarCategoria: () =>
      router.push({ pathname: "/(app)/anuncio/[id]/categoria", params: { id } }),
    titulo: formulario.titulo,
    aoMudarTitulo: (texto: string) => alterar("titulo", texto),
    tituloDica: `obrigatório · ${TITULO_MIN} a ${TITULO_MAX} caracteres`,
    tituloMax: TITULO_MAX,
    descricao: formulario.descricao,
    aoMudarDescricao: (texto: string) => alterar("descricao", texto),
    descricaoMax: DESCRICAO_MAX,
    fotos,
    ...escolhaDeFotos,
    aoRemoverFoto: removerFoto,
    data: formulario.data,
    aoMudarData: (texto: string) => alterar("data", texto),
    hora: formulario.hora,
    aoMudarHora: (texto: string) => alterar("hora", texto),
    tamanhoLocal: formulario.tamanhoLocal,
    aoMudarTamanhoLocal: (texto: string) => alterar("tamanhoLocal", texto),
    tamanhoLocalMax: TAMANHO_LOCAL_MAX,
    numeroPessoas: formulario.numeroPessoas,
    aoMudarNumeroPessoas: (texto: string) => alterar("numeroPessoas", texto.replace(/\D/g, "")),
    observacoes: formulario.observacoes,
    aoMudarObservacoes: (texto: string) => alterar("observacoes", texto),
    erros,
    erroServidor,
    salvando,
    podeSalvar: !escolhaDeFotos.preparandoFotos,
    aoSalvar: () => void aoSalvar(),
    aoVoltar: voltarPraTela16,
  };
}
