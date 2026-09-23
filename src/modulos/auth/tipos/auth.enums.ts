export const PapelUsuario = {
  CONTRATANTE: "CONTRATANTE",
  PRESTADOR: "PRESTADOR",
  ADMIN: "ADMIN",
} as const;

export type PapelUsuario = (typeof PapelUsuario)[keyof typeof PapelUsuario];

export function rotuloPapel(papel: PapelUsuario): string {
  switch (papel) {
    case PapelUsuario.CONTRATANTE:
      return "Empregador";
    case PapelUsuario.PRESTADOR:
      return "Prestador";
    case PapelUsuario.ADMIN:
      return "Administrador";
  }
}
