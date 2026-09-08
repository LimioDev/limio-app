export type Papel = "contratante" | "prestador";

export type Estado =
  | "aguardando"
  | "combinado"
  | "andamento"
  | "validacao"
  | "contestacao"
  | "concluido"
  | "cancelado"
  | "expirado";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papeis: Papel[];
}

export interface TokensAutenticacao {
  tokenAcesso: string;
  tokenRenovacao: string;
}

export interface RespostaPaginada<T> {
  conteudo: T[];
  pagina: number;
  totalPaginas: number;
  totalElementos: number;
}
