import { z } from "zod";

import { respostaPaginadaSchema } from "../../../comum/tipos/api";
import { CategoriaSchema } from "../../../comum/tipos/categoria";
import {
  APELIDO_MAX,
  CamposEnderecoFormSchema,
  CamposEnderecoRequestSchema,
} from "../../../comum/tipos/endereco";
import { Uf } from "../../../comum/tipos/localidade";
import { StatusAnuncio, StatusCandidatura, type QuandoMural } from "./anuncio.enums";

/**
 * Um anúncio da lista "Seus anúncios" (`AnuncioPainelResponse` do backend).
 * `prestadorEscolhido` vem abreviado ("Rafael S.") quando já há candidatura
 * escolhida; senão a tela mostra `candidatos` (candidaturas `ENVIADA`).
 * `fotoUrl` sai sempre `null` até o anúncio ganhar foto.
 */
export const AnuncioResumoSchema = z.object({
  id: z.string(),
  fotoUrl: z.string().nullable(),
  descricao: z.string(),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  status: z.enum(StatusAnuncio),
  candidatos: z.number().int(),
  prestadorEscolhido: z.string().nullable(),
});

export type AnuncioResumo = z.infer<typeof AnuncioResumoSchema>;

/**
 * Painel do Empregador (tela 13 "Início"), `GET /anuncios/painel-empregador`
 * (ETI-52). Só traz os anúncios abertos, da data pretendida mais próxima pra
 * mais distante. `fotoUrl` é link temporário, válido até `fotoExpiraEm`.
 */
export const PainelEmpregadorResponseSchema = z.object({
  nomeExibicao: z.string(),
  fotoUrl: z.string().nullable(),
  fotoExpiraEm: z.string().nullable(),
  anunciosAbertos: z.number().int(),
  novosCandidatos: z.number().int(),
  anuncios: z.array(AnuncioResumoSchema),
});

export type PainelEmpregadorResponse = z.infer<
  typeof PainelEmpregadorResponseSchema
>;

/*
 * Criar, anexar fotos e consultar o anúncio (ETI-59/ETI-60). O contrato do
 * card do back ainda está "a definir": os nomes abaixo são a proposta enviada
 * pro back. Mudou lá, muda aqui.
 */

/** Tamanhos do `AnuncioRequest`. O título conta sem os espaços das pontas. */
export const TITULO_MIN = 5;
export const TITULO_MAX = 80;
export const DESCRICAO_MAX = 600;
export const TAMANHO_LOCAL_MAX = 100;
/** Provisório até o PO decidir (mesma pendência das fotos no card do back). */
export const FOTOS_MAX = 5;

/**
 * Espelha `AnuncioRequest` — corpo do `POST /anuncios`. O endereço é um dos
 * dois: o id de um endereço salvo ou os campos de um avulso. Não há campo de
 * valor: o preço é combinado no chat.
 */
export const AnuncioRequestSchema = z
  .object({
    categoriaId: z.uuid(),
    titulo: z.string().trim().min(TITULO_MIN).max(TITULO_MAX),
    descricao: z.string().trim().min(1).max(DESCRICAO_MAX),
    /** Instante em UTC (ISO-8601), no futuro. */
    dataHoraPretendida: z.iso.datetime(),
    enderecoSalvoId: z.uuid().nullable(),
    enderecoAvulso: CamposEnderecoRequestSchema.nullable(),
    tamanhoLocal: z.string().trim().max(TAMANHO_LOCAL_MAX).nullable(),
    numeroPessoas: z.number().int().positive().nullable(),
    /** Opcional, sem limite no app (decisão de 26/10): quem limita é a API. */
    observacoes: z.string().trim().nullable(),
  })
  .refine((r) => (r.enderecoSalvoId === null) !== (r.enderecoAvulso === null), {
    message: "Informe um endereço salvo ou um avulso",
    path: ["enderecoSalvoId"],
  });

export type AnuncioRequest = z.infer<typeof AnuncioRequestSchema>;

/** Resposta `201` do `POST /anuncios`. */
export const AnuncioCriadoResponseSchema = z.object({
  id: z.uuid(),
  status: z.enum(StatusAnuncio),
});

export type AnuncioCriadoResponse = z.infer<typeof AnuncioCriadoResponseSchema>;

/** Uma foto do anúncio. `url` é link temporário (bucket privado), válido até `expiraEm`. */
export const FotoAnuncioResponseSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  expiraEm: z.string(),
});

export type FotoAnuncioResponse = z.infer<typeof FotoAnuncioResponseSchema>;

/** Candidato no card da tela 16: nome abreviado ("Rafael S.") e foto, se houver. */
export const CandidatoResumoSchema = z.object({
  nome: z.string(),
  fotoUrl: z.string().nullable(),
});

/**
 * Espelha `AnuncioDetalheResponse` — `GET /anuncios/{id}`, só pro dono (tela
 * 16). `candidatos` conta as candidaturas `ENVIADA`; `primeirosCandidatos`
 * traz até 4 pra fileira de avatares. O endereço completo não vem: a tela só
 * avisa que ele é liberado depois da escolha.
 */
export const AnuncioDetalheResponseSchema = z.object({
  id: z.uuid(),
  status: z.enum(StatusAnuncio),
  titulo: z.string(),
  descricao: z.string(),
  categoria: CategoriaSchema,
  dataHoraPretendida: z.string(),
  bairroRegiao: z.string().nullable(),
  uf: z.enum(Uf).nullable(),
  tamanhoLocal: z.string().nullable(),
  numeroPessoas: z.number().int().nullable(),
  fotos: z.array(FotoAnuncioResponseSchema),
  candidatos: z.number().int(),
  primeirosCandidatos: z.array(CandidatoResumoSchema),
});

export type AnuncioDetalheResponse = z.infer<typeof AnuncioDetalheResponseSchema>;

/** Passo 1 (tela 14). Mensagens em português: o schema valida o rascunho antes de seguir. */
export const PassoUmSchema = z.object({
  categoriaId: z.uuid({ error: "Escolha a categoria do serviço" }),
  titulo: z
    .string()
    .trim()
    .min(1, "Dê um título ao anúncio")
    // Só espaços cai no `min(1)` acima: o `trim` vem antes.
    .min(TITULO_MIN, `Escreva um título com pelo menos ${TITULO_MIN} caracteres.`)
    .max(TITULO_MAX, `Use no máximo ${TITULO_MAX} caracteres`),
  descricao: z
    .string()
    .trim()
    .min(1, "Conte o que precisa ser feito")
    .max(DESCRICAO_MAX, `Use no máximo ${DESCRICAO_MAX} caracteres`),
});

/**
 * "Novo endereço" do anúncio (tela 15b). Com `salvar`, vira endereço salvo
 * (POST de endereços) e o apelido é obrigatório; sem, vai como avulso só neste
 * anúncio e o apelido só dá nome à opção na tela 15.
 */
export const EnderecoAnuncioFormSchema = z
  .object({
    apelido: z.string().trim().max(APELIDO_MAX, `Use no máximo ${APELIDO_MAX} caracteres`),
    ...CamposEnderecoFormSchema.shape,
    salvar: z.boolean(),
  })
  .refine((form) => !form.salvar || form.apelido.trim().length > 0, {
    path: ["apelido"],
    message: "Informe um apelido, como Casa ou Escritório",
    // Sem isso o Zod só confere o apelido quando os outros campos já estão válidos.
    when: (contexto) => {
      const valor = contexto.value as { salvar?: unknown; apelido?: unknown };
      return typeof valor.salvar === "boolean" && typeof valor.apelido === "string";
    },
  });

export type EnderecoAnuncioFormEntrada = z.input<typeof EnderecoAnuncioFormSchema>;
export type EnderecoAnuncioForm = z.output<typeof EnderecoAnuncioFormSchema>;

/**
 * Passo 2 (tela 15), sem o endereço (escolha em lista, conferida à parte).
 * A data e a hora juntas precisam formar um instante no futuro; isso é
 * conferido no ViewModel, que sabe o "agora".
 */
export const PassoDoisSchema = z.object({
  data: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Informe a data (dd/mm/aaaa)"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Informe a hora (hh:mm)"),
  tamanhoLocal: z
    .string()
    .trim()
    .max(TAMANHO_LOCAL_MAX, `Use no máximo ${TAMANHO_LOCAL_MAX} caracteres`),
  numeroPessoas: z
    .string()
    .trim()
    .regex(/^(\d+)?$/, "Use um número inteiro")
    .refine((valor) => valor === "" || Number(valor) > 0, "Use um número maior que zero"),
});
/** Categoria resumida que vem dentro do anúncio do mural. */
export const CategoriaAnuncioSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

/**
 * Um anúncio do mural do Prestador (tela 28). Contrato provisório: o ETI-73
 * deixou a rota e os nomes "a definir". Nunca traz endereço completo,
 * coordenadas nem contato do Empregador. `publicadoEm` decide o selo "NOVO".
 */
export const AnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  categoria: CategoriaAnuncioSchema,
  fotoUrl: z.string().nullable(),
  nomeEmpregador: z.string(),
  fotoEmpregadorUrl: z.string().nullable(),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  distanciaKm: z.number(),
  publicadoEm: z.string(),
});

export type AnuncioMural = z.infer<typeof AnuncioMuralSchema>;

/** Página do mural; `totalElementos` é o "N serviços perto de você". */
export const MuralResponseSchema = respostaPaginadaSchema(AnuncioMuralSchema);

export type MuralResponse = z.infer<typeof MuralResponseSchema>;

/**
 * Filtros da tela 28a. Só reduzem a lista compatível que a API já monta:
 * `categorias` vazio é "todas" e `raioKm` nulo é o raio do perfil.
 */
export interface FiltrosMural {
  categorias: string[];
  raioKm: number | null;
  quando: QuandoMural;
}

/**
 * Detalhe do anúncio visto pelo Prestador (tela 30). `minhaCandidatura` vem
 * preenchida quando ele já se candidatou, e a tela troca "Candidatar-se" pela
 * situação. Contrato provisório, como o do mural.
 */
export const DetalheAnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  categoria: CategoriaAnuncioSchema,
  fotos: z.array(z.string()),
  dataHoraPretendida: z.string(),
  bairro: z.string().nullable(),
  cidade: z.string(),
  uf: z.string(),
  distanciaKm: z.number(),
  empregador: z.object({
    id: z.string(),
    nomeExibicao: z.string(),
    fotoUrl: z.string().nullable(),
    mediaAvaliacoes: z.number().nullable(),
    totalAvaliacoes: z.number().int(),
  }),
  minhaCandidatura: z
    .object({
      status: z.enum(StatusCandidatura),
    })
    .nullable(),
});

export type DetalheAnuncioMural = z.infer<typeof DetalheAnuncioMuralSchema>;
