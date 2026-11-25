import { useRouter } from "expo-router";
import { useState } from "react";

import { deDataHoraLocal } from "../../../comum/lib/datas";
import { erroApi, errosPorCampo, mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { diaPorExtensoEHora, primeiroNome } from "../servico/anuncio.helpers";
import { useProporReagendamentoMutation, useServicoQuery } from "../servico/anuncio.queries";
import { StatusAnuncio } from "../tipos/anuncio.enums";
import { PropostaReagendamentoFormSchema, type ServicoCombinado } from "../tipos/anuncio.types";
import { rotaDoServico } from "./rotaDoServico";

export interface ErrosPropostaReagendamento {
  data?: string;
  hora?: string;
  justificativa?: string;
}

type CampoProposta = keyof ErrosPropostaReagendamento;

/** Nome do campo no `ProporReagendamentoRequest` → campo da tela 40. */
const CAMPO_DA_API: Record<string, CampoProposta> = {
  novaDataHora: "data",
  justificativa: "justificativa",
};

export const MENSAGEM_DATA_FUTURA = "Precisa ser uma data futura";
export const MENSAGEM_LIMITE_REAGENDAMENTOS =
  "Limite de reagendamentos atingido. Faça o serviço na data combinada ou cancele.";

export interface InformacaoProposta {
  titulo: string;
  texto: string;
}

export interface PropostaReagendamentoExibida {
  /** "Quarta, 3 de setembro · 14:00". */
  dataVigente: string;
  /** "Combinado com Rafael Souza". */
  combinadoCom: string;
  /** As três informações de baixo: prazo, contador e "não volta para o mural". */
  informacoes: [InformacaoProposta, InformacaoProposta, InformacaoProposta];
}

const OUTRA_PARTE_SEM_CONTA = "Conta encerrada";

function propostaParaExibicao(servico: ServicoCombinado): PropostaReagendamentoExibida {
  const { outraParte, prazoRespostaReagendamentoHoras: prazo } = servico;
  const nome = outraParte.nome ? primeiroNome(outraParte.nome) : "A outra parte";
  // O número é o desta proposta: ela vira o próximo aceito, se aceita.
  const numero = Math.min(servico.reagendamentosAceitos + 1, servico.limiteReagendamentos);
  return {
    dataVigente: diaPorExtensoEHora(servico.dataHoraPretendida),
    combinadoCom: `Combinado com ${outraParte.nome ?? OUTRA_PARTE_SEM_CONTA}`,
    informacoes: [
      {
        // O prazo vem da API; sem ele, o texto não cita as horas.
        titulo: prazo
          ? `${nome} tem ${prazo}h para responder`
          : `${nome} tem um prazo para responder`,
        texto:
          "Sem resposta, a proposta expira e a data original continua valendo. Você pode cancelar a proposta antes disso.",
      },
      {
        titulo: `${numero} de ${servico.limiteReagendamentos} reagendamentos deste serviço`,
        texto: "No limite, o serviço ocorre na data original ou é cancelado.",
      },
      {
        titulo: "O anúncio não volta para o mural",
        texto:
          "O serviço não será reaberto para novos candidatos e não há alteração na cota utilizada.",
      },
    ],
  };
}

/** Por que a tela 40 não deixa propor; `null` quando deixa. */
function bloqueio(servico: ServicoCombinado): string | null {
  if (servico.status !== StatusAnuncio.PUBLICADO) {
    return "Este serviço não pode mais ser reagendado.";
  }
  if (servico.reagendamentosAceitos >= servico.limiteReagendamentos) {
    return MENSAGEM_LIMITE_REAGENDAMENTOS;
  }
  return null;
}

/**
 * Tela 40 "Propor reagendamento" (ETI-100), pelas duas partes: "Reagendar"
 * na tela 25 e "Propor novo horário" na tela 36. O `anuncioId` é o do serviço.
 */
export function useProporReagendamentoViewModel(anuncioId: string) {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const query = useServicoQuery(anuncioId);
  const propor = useProporReagendamentoMutation(anuncioId);

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [erros, setErros] = useState<ErrosPropostaReagendamento>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const servico = query.data;
  const naoDisponivel = erroApi(query.error)?.codigo === CodigoErro.SERVICO_NAO_ENCONTRADO;

  let erro: string | null = null;
  if (naoDisponivel) {
    erro = "Este serviço não está disponível.";
  } else if (query.isError && !servico) {
    erro = mensagemErroApi(query.error, "Não foi possível carregar o serviço.");
  } else if (servico) {
    erro = bloqueio(servico);
  }

  // Aberta sem tela antes, "voltar para o serviço" é abrir a tela dele.
  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace(rotaDoServico(anuncioId, papelAtivo));

  /** Some com o erro do campo assim que ele muda. */
  const limparErro = (campo: CampoProposta) => {
    setErroServidor(null);
    if (erros[campo]) {
      setErros(({ [campo]: _removido, ...resto }) => resto);
    }
  };

  // "Sexta, 5 de setembro · 09:00" assim que data e hora formam um instante.
  const instanteDigitado = deDataHoraLocal(data, hora);
  const previaNovaData = instanteDigitado
    ? diaPorExtensoEHora(instanteDigitado.toISOString())
    : null;

  const tratarErro = (falha: unknown) => {
    const resposta = erroApi(falha);
    switch (resposta?.codigo) {
      case CodigoErro.DATA_NO_PASSADO:
        setErros({ data: MENSAGEM_DATA_FUTURA });
        return;
      case CodigoErro.VALIDACAO_FALHOU: {
        const porCampo = errosPorCampo(resposta.mensagem, CAMPO_DA_API);
        if (Object.keys(porCampo).length > 0) {
          setErros(porCampo);
          return;
        }
        setErroServidor(resposta.mensagem);
        return;
      }
      // Já há uma proposta em aberto (de qualquer lado): abre ela (tela 41).
      case CodigoErro.PROPOSTA_PENDENTE_EXISTENTE:
        router.replace({
          pathname: "/(app)/servico/reagendamento/[id]",
          params: { id: anuncioId },
        });
        return;
      case CodigoErro.LIMITE_REAGENDAMENTOS:
        setErroServidor(MENSAGEM_LIMITE_REAGENDAMENTOS);
        return;
      // Iniciado, cancelado ou concluído entre abrir a tela e enviar.
      case CodigoErro.SERVICO_ESTADO_INVALIDO:
        mostrarToast("Este serviço não pode mais ser reagendado.", TipoToast.ERRO);
        voltar();
        return;
      case CodigoErro.SERVICO_NAO_ENCONTRADO:
        mostrarToast("Este serviço não está mais disponível.", TipoToast.ERRO);
        voltar();
        return;
      default:
        // REAGENDAMENTO_NAO_PERMITIDO e o resto: a mensagem da API diz o porquê.
        setErroServidor(mensagemErroApi(falha, "Não foi possível enviar a proposta."));
    }
  };

  const enviar = () => {
    if (propor.isPending) {
      return;
    }
    setErroServidor(null);
    const form = PropostaReagendamentoFormSchema.safeParse({ data, hora, justificativa });
    if (!form.success) {
      const novos: ErrosPropostaReagendamento = {};
      for (const problema of form.error.issues) {
        const campo = problema.path[0] as CampoProposta;
        novos[campo] ??= problema.message;
      }
      setErros(novos);
      return;
    }
    const instante = deDataHoraLocal(form.data.data, form.data.hora);
    if (!instante) {
      setErros({ data: "Data ou hora inválida" });
      return;
    }
    if (instante.getTime() <= Date.now()) {
      setErros({ data: MENSAGEM_DATA_FUTURA });
      return;
    }
    setErros({});
    propor.mutate(
      { novaDataHora: instante.toISOString(), justificativa: form.data.justificativa },
      {
        onSuccess: () => {
          mostrarToast("Proposta enviada, aguardando resposta");
          voltar();
        },
        onError: tratarErro,
      },
    );
  };

  return {
    proposta: servico && !erro ? propostaParaExibicao(servico) : null,
    carregando: query.isPending,
    erro,
    // Bloqueio por estado ou serviço indisponível: só "Voltar".
    podeTentarDeNovo: query.isError && !naoDisponivel,
    atualizando: query.isRefetching,
    aoTentarDeNovo: () => void query.refetch(),
    data,
    aoMudarData: (texto: string) => {
      setData(texto);
      limparErro("data");
    },
    hora,
    aoMudarHora: (texto: string) => {
      setHora(texto);
      limparErro("hora");
      limparErro("data");
    },
    previaNovaData,
    justificativa,
    aoMudarJustificativa: (texto: string) => {
      setJustificativa(texto);
      limparErro("justificativa");
    },
    erros,
    erroServidor,
    enviando: propor.isPending,
    aoEnviar: enviar,
    aoVoltar: voltar,
  };
}
