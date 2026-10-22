import { formatarDiaPorExtenso } from "../../../comum/lib/datas";
import { useFotoPerfilQuery } from "../servico/fotoPerfil.queries";
import { useMeuPerfilQuery } from "../servico/perfil.queries";

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

/**
 * Topo do "Início" (tela 13): foto, data e saudação. Lê o mesmo cache de
 * "Meu perfil", então a foto trocada lá aparece aqui sem nova consulta.
 */
export function useCabecalhoInicioViewModel() {
  const perfil = useMeuPerfilQuery();
  const foto = useFotoPerfilQuery();
  const nome = perfil.data?.nomeExibicao ?? "";

  return {
    nome,
    // Sem perfil ainda (carregando ou erro): só "Olá", sem nome inventado.
    saudacao: nome ? `Olá, ${primeiroNome(nome)}` : "Olá",
    dataHoje: formatarDiaPorExtenso(),
    fotoUrl: foto.data?.url ?? null,
  };
}
