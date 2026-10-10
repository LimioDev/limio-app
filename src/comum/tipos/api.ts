export type Estado =
  | "aguardando"
  | "combinado"
  | "andamento"
  | "validacao"
  | "contestacao"
  | "concluido"
  | "cancelado"
  | "expirado";

export interface RespostaPaginada<T> {
  conteudo: T[];
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
}
