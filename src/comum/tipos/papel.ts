/**
 * Espelha `PapelUsuario` do backend (`comum/seguranca/enums`). Fica em `comum/`
 * porque a sessão (`comum/store/sessao.ts`) e o roteamento por papel precisam
 * dele sem importar o módulo `auth`.
 */
export const PapelUsuario = {
  EMPREGADOR: "EMPREGADOR",
  PRESTADOR: "PRESTADOR",
  ADMIN: "ADMIN",
} as const;

export type PapelUsuario = (typeof PapelUsuario)[keyof typeof PapelUsuario];

export function rotuloPapel(papel: PapelUsuario): string {
  switch (papel) {
    case PapelUsuario.EMPREGADOR:
      return "Empregador";
    case PapelUsuario.PRESTADOR:
      return "Prestador";
    case PapelUsuario.ADMIN:
      return "Administrador";
  }
}

/**
 * Papéis atendidos pelo app mobile. `ADMIN` fica de fora: conta de
 * administrador não tem dashboard aqui e não chega a abrir sessão no app.
 */
export type PapelDoApp = Exclude<PapelUsuario, typeof PapelUsuario.ADMIN>;

export function ehPapelDoApp(papel: string | null): papel is PapelDoApp {
  return papel === PapelUsuario.EMPREGADOR || papel === PapelUsuario.PRESTADOR;
}
