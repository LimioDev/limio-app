import { useRouter } from "expo-router";
import { useState } from "react";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { rotuloPapel } from "../../../comum/tipos/papel";
import { useTrocarPapelMutation } from "../servico/auth.queries";
import type { PapelAlternavel } from "../tipos/auth.types";
import { rotaDashboard } from "./rotaDashboard";

const DESCRICOES: Record<PapelAlternavel, string> = {
  EMPREGADOR: "Publique demandas e escolha quem vai fazer o serviço.",
  PRESTADOR: "Encontre serviços perto de você e se candidate.",
};

const PAPEIS_ALTERNAVEIS: PapelAlternavel[] = ["EMPREGADOR", "PRESTADOR"];

export interface OpcaoPapel {
  papel: PapelAlternavel;
  rotulo: string;
  descricao: string;
  ativo: boolean;
}

export function useTrocarPapelViewModel() {
  const router = useRouter();
  const papelAtivo = useSessao((estado) => estado.papelAtivo);
  const definirPapelAtivo = useSessao((estado) => estado.definirPapelAtivo);
  const mutation = useTrocarPapelMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const opcoes: OpcaoPapel[] = PAPEIS_ALTERNAVEIS.map((papel) => ({
    papel,
    rotulo: rotuloPapel(papel),
    descricao: DESCRICOES[papel],
    ativo: papel === papelAtivo,
  }));

  const aoEscolher = async (papel: PapelAlternavel) => {
    if (papel === papelAtivo) {
      router.back();
      return;
    }
    setErroServidor(null);
    try {
      const resposta = await mutation.mutateAsync(papel);
      // Sessão derrubada na renovação: o store já está anônimo e o guard da
      // raiz leva à Boas-vindas — não há papel a aplicar nem rota a abrir.
      if (!resposta) {
        return;
      }
      await definirPapelAtivo(resposta.papelAtivo);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace(rotaDashboard(resposta.papelAtivo));
    } catch (erro) {
      setErroServidor(
        mensagemErroApi(erro, "Não foi possível trocar de papel. Tente novamente."),
      );
    }
  };

  return {
    opcoes,
    aoEscolher,
    papelEmTroca: mutation.isPending ? mutation.variables : null,
    erroServidor,
    aoFechar: () => router.back(),
  };
}
