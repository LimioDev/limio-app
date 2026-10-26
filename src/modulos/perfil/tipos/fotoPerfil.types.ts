import { z } from "zod";

/**
 * Critério PROVISÓRIO do backend (TICKET-0056), até o PO decidir: JPEG ou PNG
 * de até 5 MB (`perfil.foto.tamanho-maximo`). Mudou lá, muda aqui.
 */
export const FOTO_PERFIL_TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

export const FOTO_PERFIL_TIPOS_ACEITOS = ["image/jpeg", "image/png"] as const;

export type TipoFotoPerfil = (typeof FOTO_PERFIL_TIPOS_ACEITOS)[number];

/** Mesma mensagem pra recusa no app e `FOTO_INVALIDA` da API: diz o que é aceito. */
export const MENSAGEM_FOTO_INVALIDA = "Use uma foto JPG ou PNG de até 5 MB.";

/**
 * Espelha `FotoPerfilResponse` do backend — resposta de `GET` e `PUT
 * /conta/foto-perfil`. `url` é um link temporário (bucket privado): vale até
 * `expiraEm`; depois o app consulta de novo. Nunca guardar como permanente.
 */
export const FotoPerfilResponseSchema = z.object({
  url: z.url(),
  expiraEm: z.string(),
});

export type FotoPerfilResponse = z.infer<typeof FotoPerfilResponseSchema>;

/**
 * Arquivo pronto pra `PUT /conta/foto-perfil`, conferido antes do envio. A API
 * identifica o formato pelo conteúdo; aqui o app só evita mandar o que ela vai
 * recusar.
 */
export const ArquivoFotoPerfilSchema = z.object({
  uri: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.enum(FOTO_PERFIL_TIPOS_ACEITOS, { error: MENSAGEM_FOTO_INVALIDA }),
  tamanhoBytes: z
    .number()
    .int()
    .positive(MENSAGEM_FOTO_INVALIDA)
    .max(FOTO_PERFIL_TAMANHO_MAXIMO_BYTES, MENSAGEM_FOTO_INVALIDA),
  /** Só no web: o `FormData` do navegador precisa do conteúdo, não da URI. */
  conteudo: z.instanceof(Blob).optional(),
});

export type ArquivoFotoPerfil = z.infer<typeof ArquivoFotoPerfilSchema>;
