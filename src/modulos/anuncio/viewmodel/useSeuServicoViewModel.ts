import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";

import { erroApi, mensagemErroApi } from "../../../comum/lib/erros";
import { formatarTelefone, telefoneNacional } from "../../../comum/lib/telefone";
import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { PapelUsuario } from "../../../comum/tipos/papel";
import {
  diaComData,
  horaPretendida,
  momentoDoPasso,
} from "../servico/anuncio.helpers";
import { useIniciarServicoMutation, useServicoQuery } from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import type { ServicoCombinado } from "../tipos/anuncio.types";

export type SituacaoPasso = "feito" | "atual" | "futuro";

export interface PassoServicoExibido {
  titulo: string;
  /** "hoje · 14:06", "próximo passo"... */
  detalhe: string;
  situacao: SituacaoPasso;
}

export interface ServicoExibido {
  /** Selo do topo: "Combinado", "Em andamento"... */
  selo: string;
  titulo: string;
  /** "14:00 · Qua, 03/09". */
  quando: string;
  empregador: {
    nome: string;
    fotoUrl: string | null;
    /** "(11) 98254-4472"; `null` quando a conta foi encerrada. */
    telefone: string | null;
  };
  /** `null` quando a API não conseguiu montar o endereço. */
  endereco: string | null;
  bairro: string | null;
  /** Tela 37: o serviço já foi iniciado. */
  emAndamento: boolean;
  /** Só na tela 37, depois de iniciar. */
  andamento: PassoServicoExibido[];
  /** "Iniciar serviço": só pro Prestador escolhido, com o serviço em `PUBLICADO`. */
  podeIniciar: boolean;
}

export interface FolhaIniciarExibida {
  aberta: boolean;
  /** "Instalar 3 tomadas · Marina Bertoldi". */
  resumo: string;
  /** Primeiro nome do Empregador, usado nos itens da folha. */
  empregador: string;
  /** Chamada em andamento: botões travados e a folha não fecha. */
  enviando: boolean;
  erro: string | null;
}

const EMPREGADOR_SEM_CONTA = "Conta encerrada";

function primeiroNome(nome: string | null): string {
  return nome?.trim().split(/\s+/)[0] || "o Empregador";
}

function rotuloSelo(status: StatusAnuncio): string {
  switch (status) {
    // Com candidatura escolhida, `PUBLICADO` é o "Combinado" do protótipo.
    case StatusAnuncio.PUBLICADO:
      return "Combinado";
    case StatusAnuncio.EM_ANDAMENTO:
      return "Em andamento";
    case StatusAnuncio.AGUARDANDO_VALIDACAO:
      return "Aguardando validação";
    case StatusAnuncio.CONCLUIDO:
      return "Concluído";
    case StatusAnuncio.ENCERRADO:
      return "Cancelado";
  }
}

/** Linha do tempo da tela 37: escolha, início, check-out (ETI-90/91) e validação (ETI-92/93). */
function passosDoServico(servico: ServicoCombinado): PassoServicoExibido[] {
  const { escolhidaEm, iniciadoEm, checkoutEm, validadoEm } = servico;
  if (!iniciadoEm) {
    return [];
  }
  const passos: PassoServicoExibido[] = [];
  if (escolhidaEm) {
    passos.push({
      titulo: "Sua candidatura foi escolhida",
      detalhe: momentoDoPasso(escolhidaEm),
      situacao: "feito",
    });
  }
  passos.push({
    titulo: "Serviço iniciado",
    detalhe: momentoDoPasso(iniciadoEm),
    situacao: "feito",
  });
  passos.push({
    titulo: "Check-out com foto",
    detalhe: checkoutEm ? momentoDoPasso(checkoutEm) : "próximo passo",
    situacao: checkoutEm ? "feito" : "atual",
  });
  passos.push({
    titulo: "Validação do cliente",
    detalhe: validadoEm ? momentoDoPasso(validadoEm) : "prazo de 24h após o check-out",
    situacao: validadoEm ? "feito" : checkoutEm ? "atual" : "futuro",
  });
  return passos;
}

function servicoParaExibicao(servico: ServicoCombinado, ehPrestador: boolean): ServicoExibido {
  const { outraParte } = servico;
  return {
    selo: rotuloSelo(servico.status),
    titulo: servico.titulo,
    quando: `${horaPretendida(servico.dataHoraPretendida)} · ${diaComData(servico.dataHoraPretendida)}`,
    empregador: {
      nome: outraParte.nome ?? EMPREGADOR_SEM_CONTA,
      fotoUrl: outraParte.fotoUrl,
      telefone: outraParte.telefone
        ? formatarTelefone(telefoneNacional(outraParte.telefone))
        : null,
    },
    endereco: servico.enderecoCompleto,
    bairro: servico.bairroRegiao,
    emAndamento: servico.iniciadoEm !== null,
    andamento: passosDoServico(servico),
    // A API só devolve o serviço pro Empregador dono e pro Prestador escolhido;
    // com o papel de Prestador ativo, quem vê a tela é o escolhido.
    podeIniciar: ehPrestador && servico.status === StatusAnuncio.PUBLICADO,
  };
}

/** Telas 36 e 37 "Seu serviço" do Prestador escolhido, com "Iniciar serviço" (ETI-89). */
export function useSeuServicoViewModel(anuncioId: string) {
  const router = useRouter();
  const query = useServicoQuery(anuncioId);
  const iniciar = useIniciarServicoMutation(anuncioId);
  const ehPrestador = useSessao((estado) => estado.papelAtivo === PapelUsuario.PRESTADOR);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [erroFolha, setErroFolha] = useState<string | null>(null);

  let erro: string | null = null;
  // Serviço que não é (mais) dele não volta com "Tentar de novo".
  let podeTentarDeNovo = true;
  if (query.isError && !query.data) {
    podeTentarDeNovo = erroApi(query.error)?.codigo !== CodigoErro.SERVICO_NAO_ENCONTRADO;
    erro = podeTentarDeNovo
      ? mensagemErroApi(query.error, "Não foi possível carregar o serviço.")
      : "Este serviço não está disponível.";
  }

  const servico = query.data ? servicoParaExibicao(query.data, ehPrestador) : null;
  const telefoneNacionalEmpregador = query.data?.outraParte.telefone
    ? telefoneNacional(query.data.outraParte.telefone)
    : null;

  function fecharFolha() {
    setFolhaAberta(false);
    setErroFolha(null);
  }

  function confirmarInicio() {
    setErroFolha(null);
    iniciar.mutate(undefined, {
      onSuccess: fecharFolha,
      onError: (falha) => {
        switch (erroApi(falha)?.codigo) {
          // Já iniciado, cancelado ou fora de `PUBLICADO`: a mutation já recarrega o serviço.
          case CodigoErro.SERVICO_ESTADO_INVALIDO:
            fecharFolha();
            mostrarToast("Este serviço não pode mais ser iniciado.", TipoToast.ERRO);
            return;
          // Deixou de ser o escolhido entre abrir a tela e confirmar.
          case CodigoErro.SERVICO_NAO_ENCONTRADO:
            fecharFolha();
            mostrarToast("Este serviço não está mais disponível.", TipoToast.ERRO);
            return;
          default:
            setErroFolha(mensagemErroApi(falha, "Não foi possível iniciar o serviço."));
        }
      },
    });
  }

  const nomeEmpregador = query.data?.outraParte.nome ?? null;
  const folha: FolhaIniciarExibida = {
    aberta: folhaAberta,
    resumo: query.data
      ? `${query.data.titulo} · ${nomeEmpregador ?? EMPREGADOR_SEM_CONTA}`
      : "",
    empregador: primeiroNome(nomeEmpregador),
    enviando: iniciar.isPending,
    erro: erroFolha,
  };

  return {
    servico,
    carregando: query.isPending,
    erro,
    podeTentarDeNovo,
    atualizando: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    aoVoltar: () => router.back(),
    aoLigar: telefoneNacionalEmpregador
      ? () => void Linking.openURL(`tel:${telefoneNacionalEmpregador}`)
      : undefined,
    aoAbrirWhatsApp: telefoneNacionalEmpregador
      ? () => void Linking.openURL(`https://wa.me/55${telefoneNacionalEmpregador}`)
      : undefined,
    folha,
    aoIniciar: () => setFolhaAberta(true),
    aoConfirmarInicio: confirmarInicio,
    aoFecharFolha: fecharFolha,
  };
}
