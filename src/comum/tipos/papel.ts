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
