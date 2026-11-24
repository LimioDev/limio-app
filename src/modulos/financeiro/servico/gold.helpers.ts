import { formatarDataHora, paraFusoLocal } from "../../../comum/lib/datas";
import { somenteDigitos } from "../../../comum/lib/telefone";
import { StatusCobranca } from "../tipos/gold.enums";
import type {
  CartaoForm,
  CartaoSalvo,
  Cobranca,
  TrocarCartaoRequest,
} from "../tipos/gold.types";

/** 2990 + "BRL" → "R$ 29,90". Moeda fora do padrão ISO cai no número puro. */
export function formatarPreco(centavos: number, moeda: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(
      centavos / 100,
    );
  } catch {
    return (centavos / 100).toFixed(2).replace(".", ",");
  }
}

/** `{bandeira: "VISA", ultimos4: "4419"}` → "Visa •••• 4419". */
export function rotuloCartao(cartao: CartaoSalvo): string {
  const bandeira = cartao.bandeira
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
  return `${bandeira} •••• ${cartao.ultimos4}`;
}

/**
 * "Cobrança todo dia 18". O ciclo começa na hora da assinatura, então o dia
 * da cobrança é o de hoje (fuso do sistema).
 */
export function textoDiaCobranca(agora: Date = new Date()): string {
  return `Cobrança todo dia ${paraFusoLocal(agora).getDate()}`;
}

export interface LinhaCobranca {
  /** "30/08/2026". */
  data: string;
  /** "R$ 29,90 · paga" ou "Recusada · nova tentativa em 02/09". */
  detalhe: string;
  recusada: boolean;
}

/** Uma linha de "Cobranças" da tela 35. Status que o app não conhece mostra só o valor. */
export function linhaCobranca(cobranca: Cobranca, moeda: string): LinhaCobranca {
  const valor = formatarPreco(cobranca.valorCentavos, moeda);
  const data = formatarDataHora(cobranca.data, "dd/MM/yyyy");
  switch (cobranca.status) {
    case StatusCobranca.APROVADA:
      return { data, detalhe: `${valor} · paga`, recusada: false };
    case StatusCobranca.PENDENTE:
      return { data, detalhe: `${valor} · processando`, recusada: false };
    case StatusCobranca.RECUSADA:
      return {
        data,
        detalhe: cobranca.proximaTentativaEm
          ? `Recusada · nova tentativa em ${formatarDataHora(cobranca.proximaTentativaEm, "dd/MM")}`
          : `${valor} · recusada`,
        recusada: true,
      };
    default:
      return { data, detalhe: valor, recusada: false };
  }
}

/**
 * Data da nova tentativa quando a cobrança mais recente foi recusada (alerta
 * "Ação necessária" da tela 35); `null` sem falha pendente.
 */
export function novaTentativaPendente(cobrancas: Cobranca[]): string | null {
  const ultima = cobrancas[0];
  if (ultima?.status !== StatusCobranca.RECUSADA || !ultima.proximaTentativaEm) {
    return null;
  }
  return formatarDataHora(ultima.proximaTentativaEm, "dd/MM");
}

/** Formulário da tela "Cartão" → `TrocarCartaoRequest`, sem máscara. */
export function paraTrocarCartaoRequest(form: CartaoForm): TrocarCartaoRequest {
  const [mes, ano] = form.validade.split("/");
  const nome = form.nomeTitular.trim();
  return {
    holderName: nome,
    numero: somenteDigitos(form.numero),
    expiryMonth: mes,
    expiryYear: `20${ano}`,
    ccv: form.cvv,
    holderNome: nome,
    holderEmail: form.email.trim(),
    holderCpf: somenteDigitos(form.cpf),
    holderCep: somenteDigitos(form.cep),
    holderNumeroEndereco: form.numeroEndereco.trim(),
    holderTelefone: somenteDigitos(form.telefone),
  };
}
