import { useRouter } from "expo-router";

import { mensagemErroApi } from "../../../comum/lib/erros";
import { useSessao } from "../../../comum/store/sessao";
import { PapelUsuario, rotuloPapel, type PapelDoApp } from "../../../comum/tipos/papel";
import { resumoAtuacao } from "../servico/atuacao.helpers";
import { usePerfilAtuacaoQuery } from "../servico/atuacao.queries";
import { resumoEnderecos } from "../servico/endereco.helpers";
import { useEnderecosQuery } from "../../../comum/servico/endereco.queries";
import { formatarTelefone, telefoneNacional } from "../servico/perfil.helpers";
import { useMeuPerfilQuery } from "../servico/perfil.queries";
import type { PerfilEmpregadorResponse } from "../tipos/perfil.types";
import { useTrocarFotoPerfilViewModel } from "./useTrocarFotoPerfilViewModel";

const DESCRICAO_PAPEL: Record<PapelDoApp, string> = {
  EMPREGADOR: "Seus anúncios e candidatos",
  PRESTADOR: "Vendo o mural e suas aplicações",
};

export interface PerfilExibido {
  nomeExibicao: string;
  /** `null` = sem avaliações: a tela mostra "sem avaliações", nunca 0,0. */
  avaliacoes: { nota: number; total: number } | null;
  email: string;
  /** Já com "· verificado" quando a API diz que está confirmado. */
  telefone: string;
}

function paraExibicao(perfil: PerfilEmpregadorResponse): PerfilExibido {
  const temAvaliacoes =
    perfil.qtdAvaliacoes > 0 && perfil.mediaAvaliacoes !== null;
  const telefone = perfil.telefone
    ? formatarTelefone(telefoneNacional(perfil.telefone))
    : "Não informado";

  return {
    nomeExibicao: perfil.nomeExibicao,
    avaliacoes: temAvaliacoes
      ? { nota: perfil.mediaAvaliacoes!, total: perfil.qtdAvaliacoes }
      : null,
    email: perfil.email,
    telefone:
      perfil.telefone && perfil.telefoneConfirmadoEm
        ? `${telefone} · verificado`
        : telefone,
  };
}

export function useMeuPerfilViewModel() {
  const router = useRouter();
  // `(app)` só abre com sessão de papel do app; o fallback só satisfaz o tipo.
  const papelAtivo = useSessao((estado) => estado.papelAtivo) ?? PapelUsuario.EMPREGADOR;
  const query = useMeuPerfilQuery();
  const ehPrestador = papelAtivo === PapelUsuario.PRESTADOR;
  const atuacao = usePerfilAtuacaoQuery({ habilitado: ehPrestador });
  // Endereços salvos são só do Empregador. O resumo vem da lista: o `GET` do
  // perfil ainda devolve `enderecos` vazio (fora do escopo do card do back).
  const enderecos = useEnderecosQuery({ habilitado: !ehPrestador });
  const { aoAtualizarFoto, ...foto } = useTrocarFotoPerfilViewModel();

  return {
    perfil: query.data ? paraExibicao(query.data) : null,
    carregando: query.isPending,
    erro: query.isError
      ? mensagemErroApi(query.error, "Não foi possível carregar seu perfil.")
      : null,
    atualizando: query.isRefetching,
    aoAtualizar: () => {
      void query.refetch();
      aoAtualizarFoto();
      if (ehPrestador) {
        void atuacao.refetch();
      } else {
        void enderecos.refetch();
      }
    },
    papelAtivo: {
      rotulo: rotuloPapel(papelAtivo),
      descricao: DESCRICAO_PAPEL[papelAtivo],
    },
    // Só no papel Prestador. Sem resposta da API ainda, não marca incompleto.
    atuacao: ehPrestador
      ? {
          resumo:
            (atuacao.data && resumoAtuacao(atuacao.data)) ??
            "Escolha especialidades, raio e município",
          incompleto: atuacao.data ? !atuacao.data.completo : false,
        }
      : null,
    // Só no papel Empregador. Sem resposta ainda, não afirma "nenhum endereço".
    enderecos: ehPrestador
      ? null
      : enderecos.data
        ? resumoEnderecos(enderecos.data)
        : enderecos.isError
          ? "Ver endereços"
          : "Carregando...",
    aoAbrirAjustes: () => router.push("/(app)/ajustes"),
    aoTrocarPapel: () => router.push("/(app)/trocar-papel"),
    aoEditarContato: () => router.push("/(app)/conta/dados-contato"),
    aoAbrirAtuacao: () => router.push("/(app)/conta/atuacao"),
    aoAbrirEnderecos: () => router.push("/(app)/conta/enderecos"),
    ...foto,
  };
}
