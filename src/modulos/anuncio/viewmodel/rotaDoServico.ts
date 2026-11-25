import type { Href } from "expo-router";

import { PapelUsuario, type PapelDoApp } from "../../../comum/tipos/papel";

/**
 * Tela do serviço de cada lado: 25 "Serviço combinado" do Empregador ou 36
 * "Seu serviço" do Prestador. Usada pelas telas 40 e 41 quando abertas sem
 * tela antes (link ou notificação), pra "voltar para o serviço".
 */
export function rotaDoServico(anuncioId: string, papel: PapelDoApp | null): Href {
  return papel === PapelUsuario.EMPREGADOR
    ? { pathname: "/(app)/servico/combinado/[id]", params: { id: anuncioId } }
    : { pathname: "/(app)/servico/[id]", params: { id: anuncioId } };
}
