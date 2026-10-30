import { z } from "zod";

import { respostaPaginadaSchema } from "../../../comum/tipos/api";
import { CategoriaSchema } from "../../../comum/tipos/categoria";
import {
  APELIDO_MAX,
  CamposEnderecoFormSchema,
  CamposEnderecoRequestSchema,
} from "../../../comum/tipos/endereco";
import { Uf } from "../../../comum/tipos/localidade";
import { StatusAnuncio, StatusAplicacao, type QuandoMural } from "./anuncio.enums";

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
/**
 * Espelha `MuralItemResponse` — item do `GET /anuncios/mural` (ETI-73). Nunca
 * traz endereço completo, coordenadas nem contato do Empregador; a localização
 * é só `bairroRegiao` + `distanciaKm` (arredondada a 0,1 km). `fotoUrl` é a
 * primeira foto (link temporário), `null` sem foto ou com o storage fora do ar.
 * `publicadoEm` decide o selo "NOVO", mas ainda não está no contrato do back:
 * sem ele, o selo não aparece.
 */
export const AnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  categoria: CategoriaSchema,
  fotoUrl: z.string().nullable(),
  empregador: z.object({
    nomeExibicao: z.string(),
    fotoUrl: z.string().nullable(),
  }),
  dataHoraPretendida: z.string(),
  bairroRegiao: z.string().nullable(),
  distanciaKm: z.number(),
  publicadoEm: z.string().nullish(),
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
 * Foto no detalhe do mural (`FotoAnuncioResponse`). Diferente da tela 16,
 * `url` e `expiraEm` podem vir `null` quando o storage não respondeu.
 */
export const FotoMuralSchema = z.object({
  id: z.string(),
  url: z.string().nullable(),
  expiraEm: z.string().nullable(),
});

/**
 * Espelha `MuralDetalheResponse` — `GET /anuncios/mural/{id}` (ETI-73), visto
 * pelo Prestador na tela 30. `cidade` é `null` em anúncio antigo cujo endereço
 * não pôde ser lido; `mediaAvaliacoes` é `null` com `qtdAvaliacoes` 0.
 * `minhaCandidatura` vem preenchida quando ele já se candidatou, e a tela
 * troca "Candidatar-se" pela situação; o `id` abre o chat da candidatura.
 */
export const DetalheAnuncioMuralSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  descricao: z.string(),
  categoria: CategoriaSchema,
  fotos: z.array(FotoMuralSchema),
  dataHoraPretendida: z.string(),
  bairroRegiao: z.string().nullable(),
  cidade: z.string().nullable(),
  uf: z.enum(Uf).nullable(),
  distanciaKm: z.number(),
  empregador: z.object({
    nomeExibicao: z.string(),
    fotoUrl: z.string().nullable(),
    mediaAvaliacoes: z.number().nullable(),
    qtdAvaliacoes: z.number().int(),
  }),
  minhaCandidatura: z
    .object({
      id: z.string(),
      status: z.enum(StatusAplicacao),
    })
    .nullable(),
});

export type DetalheAnuncioMural = z.infer<typeof DetalheAnuncioMuralSchema>;
