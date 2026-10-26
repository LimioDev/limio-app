import { z } from "zod";

/**
 * Critério PROVISÓRIO do backend (TICKET-0056), até o PO decidir: JPEG ou PNG
 * de até 5 MB (`perfil.foto.tamanho-maximo`). Vale pra foto de perfil e pras
 * fotos do anúncio. Mudou lá, muda aqui.
 */
export const FOTO_TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

export const FOTO_TIPOS_ACEITOS = ["image/jpeg", "image/png"] as const;

export type TipoFoto = (typeof FOTO_TIPOS_ACEITOS)[number];

/** Mesma mensagem pra recusa no app e `FOTO_INVALIDA` da API: diz o que é aceito. */
export const MENSAGEM_FOTO_INVALIDA = "Use uma foto JPG ou PNG de até 5 MB.";

/**
 * Arquivo de foto pronto pra ir num `multipart`, conferido antes do envio. A
 * API identifica o formato pelo conteúdo; aqui o app só evita mandar o que ela
 * vai recusar.
 */
export const ArquivoFotoSchema = z.object({
  uri: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.enum(FOTO_TIPOS_ACEITOS, { error: MENSAGEM_FOTO_INVALIDA }),
  tamanhoBytes: z
    .number()
    .int()
    .positive(MENSAGEM_FOTO_INVALIDA)
    .max(FOTO_TAMANHO_MAXIMO_BYTES, MENSAGEM_FOTO_INVALIDA),
  /** Só no web: o `FormData` do navegador precisa do conteúdo, não da URI. */
  conteudo: z.instanceof(Blob).optional(),
});

export type ArquivoFoto = z.infer<typeof ArquivoFotoSchema>;
