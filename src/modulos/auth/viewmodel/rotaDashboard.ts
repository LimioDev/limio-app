import type { Href } from "expo-router";

import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";

/** Dashboard de cada papel: tela 13 (Empregador) ou tela 28 Mural (Prestador). */
export function rotaDashboard(papel: PapelDoApp): Href {
  switch (papel) {
    case PapelUsuario.EMPREGADOR:
      return "/(app)/(contratante)";
    case PapelUsuario.PRESTADOR:
      return "/(app)/(prestador)";
  }
}
