import { z } from "zod";

import { somenteDigitos } from "../../../comum/lib/telefone";

import { CicloPlano, StatusAssinatura, StatusCobranca } from "./gold.enums";

/** Espelha `CartaoSalvoResponse` do backend: só bandeira e últimos 4 dígitos. */
export const CartaoSalvoSchema = z.object({
  bandeira: z.string(),
  ultimos4: z.string(),
});

export type CartaoSalvo = z.infer<typeof CartaoSalvoSchema>;

/**
 * Espelha `ConsultarGoldResponse` do backend — `GET /financeiro/gold`
 * (ETI-81). Preço e ciclo vêm da API, nunca fixos no app. `cartaoSalvo` é
 * nulo quando o Prestador ainda não tem cartão.
 */
export const PlanoGoldResponseSchema = z.object({
  codigoPlano: z.string(),
  nome: z.string(),
  precoCentavos: z.number().int().nonnegative(),
  moeda: z.string(),
  // Ciclo novo no back não pode derrubar a tela: fica sem o "/mês".
  ciclo: z.enum(CicloPlano).or(z.string()),
  cartaoSalvo: CartaoSalvoSchema.nullable(),
});

export type PlanoGoldResponse = z.infer<typeof PlanoGoldResponseSchema>;

/**
 * Espelha `AssinarGoldRequest` do backend. Sem `gatewayToken`: a cobrança usa
 * o cartão salvo do Prestador. O app nunca recebe nem guarda o token do
 * gateway (o `GET` só devolve bandeira e últimos 4).
 */
export interface AssinarGoldRequest {
  codigoPlano: string;
}

/**
 * Espelha `AssinarGoldResponse` do backend — `POST /financeiro/gold/assinatura`.
 * `renovaEm` é o fim do ciclo pago (`Instant`, em UTC).
 */
export const AssinarGoldResponseSchema = z.object({
  status: z.enum(StatusAssinatura).or(z.string()),
  renovaEm: z.iso.datetime({ offset: true }),
});

export type AssinarGoldResponse = z.infer<typeof AssinarGoldResponseSchema>;

/** Uma tentativa de cobrança em "Cobranças" da tela 35. */
export const CobrancaSchema = z.object({
  data: z.iso.datetime({ offset: true }),
  valorCentavos: z.number().int().nonnegative(),
  // Status novo no back não pode derrubar a tela: a linha fica sem rótulo.
  status: z.enum(StatusCobranca).or(z.string()),
  /** Só numa cobrança recusada que ainda vai ser tentada de novo. */
  proximaTentativaEm: z.iso.datetime({ offset: true }).nullable(),
});

export type Cobranca = z.infer<typeof CobrancaSchema>;

/**
 * "Consultar minha assinatura" — `GET /financeiro/gold/assinatura` (ETI-83,
 * contrato proposto no card). Também é a resposta do "Cancelar renovação".
 * `dataFimCiclo` é o fim do período pago: a data de renovação ou, com
 * `canceladaEm` preenchido, o último dia do GOLD. `cobrancas` vem da mais
 * recente para a mais antiga.
 */
export const AssinaturaGoldResponseSchema = z.object({
  status: z.enum(StatusAssinatura).or(z.string()),
  precoCentavos: z.number().int().nonnegative(),
  moeda: z.string(),
  ciclo: z.enum(CicloPlano).or(z.string()),
  dataFimCiclo: z.iso.datetime({ offset: true }),
  canceladaEm: z.iso.datetime({ offset: true }).nullable(),
  cartao: CartaoSalvoSchema.nullable(),
  cobrancas: z.array(CobrancaSchema),
});

export type AssinaturaGoldResponse = z.infer<typeof AssinaturaGoldResponseSchema>;

/**
 * Espelha `TokenizarCartaoRequest` do backend — `POST /financeiro/gold/cartao`.
 * Os dados do cartão só passam pela API até o gateway: o app não guarda nada.
 * `holderName` é o nome impresso; `holderNome`/`holderCpf`/... são do titular.
 */
export interface TrocarCartaoRequest {
  holderName: string;
  numero: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  holderNome: string;
  holderEmail: string;
  holderCpf: string;
  holderCep: string;
  holderNumeroEndereco: string;
  holderTelefone: string;
}

/**
 * Resposta do "Trocar cartão": o cartão novo, já ativo. O `gatewayToken` que
 * a API ainda devolve fica de fora (o Zod descarta).
 */
export const TrocarCartaoResponseSchema = CartaoSalvoSchema;

export type TrocarCartaoResponse = z.infer<typeof TrocarCartaoResponseSchema>;

/** Validade "MM/AA" ainda não vencida (o cartão vale até o fim do mês). */
function validadeOk(valor: string, agora: Date = new Date()): boolean {
  const partes = /^(\d{2})\/(\d{2})$/.exec(valor);
  if (!partes) {
    return false;
  }
  const mes = Number(partes[1]);
  const ano = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) {
    return false;
  }
  return ano * 12 + mes >= agora.getFullYear() * 12 + agora.getMonth() + 1;
}

/**
 * Formulário da tela "Cartão" (trocar ou adicionar). Os campos chegam com
 * máscara; a conversão para o `TrocarCartaoRequest` tira a pontuação.
 * Nada daqui é salvo no aparelho.
 */
export const CartaoFormSchema = z.object({
  nomeTitular: z.string().trim().min(3, "Informe o nome como está no cartão."),
  numero: z
    .string()
    .refine((v) => /^\d{13,19}$/.test(somenteDigitos(v)), "Confira o número do cartão."),
  validade: z.string().refine((v) => validadeOk(v), "Validade inválida ou vencida."),
  cvv: z.string().regex(/^\d{3,4}$/, "O CVV tem 3 ou 4 dígitos."),
  cpf: z.string().refine((v) => somenteDigitos(v).length === 11, "Informe o CPF do titular."),
  email: z.email("Informe um e-mail válido."),
  telefone: z
    .string()
    .refine(
      (v) => somenteDigitos(v).length >= 10 && somenteDigitos(v).length <= 11,
      "Informe o telefone com DDD.",
    ),
  cep: z.string().refine((v) => somenteDigitos(v).length === 8, "O CEP tem 8 dígitos."),
  numeroEndereco: z.string().trim().min(1, "Informe o número do endereço."),
});

export type CartaoForm = z.infer<typeof CartaoFormSchema>;
