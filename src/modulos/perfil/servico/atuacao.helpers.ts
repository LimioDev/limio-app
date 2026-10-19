import type {
  JanelaAtendimento,
  PerfilAtuacaoResponse,
} from "../tipos/atuacao.types";
import {
  DIAS_SEMANA,
  rotuloDia,
  rotuloDiaCurto,
  type Uf,
} from "../tipos/perfil.enums";

/** "São Paulo · SP" — mesmo formato do campo "Cidade e UF" do cadastro. */
export function rotuloMunicipio(nome: string, uf: Uf): string {
  return `${nome} · ${uf}`;
}

/** Busca sem diferenciar maiúsculas nem acentos ("eletrica" acha "Elétrica"). */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export interface FaixaJanela {
  /** "Seg a Sex", "Seg e Ter" ou "Sábado". */
  dias: string;
  /** "08:00 – 18:00". */
  horario: string;
}

function rotuloDias(inicio: number, fim: number): string {
  if (inicio === fim) {
    return rotuloDia(DIAS_SEMANA[inicio]);
  }
  const separador = fim - inicio === 1 ? " e " : " a ";
  return `${rotuloDiaCurto(DIAS_SEMANA[inicio])}${separador}${rotuloDiaCurto(DIAS_SEMANA[fim])}`;
}

/**
 * Junta dias seguidos com o mesmo horário numa faixa só, como na tela 10:
 * "Seg a Sex 08:00 – 18:00", "Sábado 08:00 – 13:00". Ordem: dia, depois horário.
 */
export function agruparJanelas(janelas: JanelaAtendimento[]): FaixaJanela[] {
  const porHorario = new Map<string, number[]>();
  for (const janela of janelas) {
    const horario = `${janela.horaInicio} – ${janela.horaFim}`;
    const dias = porHorario.get(horario) ?? [];
    dias.push(DIAS_SEMANA.indexOf(janela.diaSemana));
    porHorario.set(horario, dias);
  }

  const faixas: { inicio: number; horario: string; dias: string }[] = [];
  for (const [horario, dias] of porHorario) {
    const ordenados = [...new Set(dias)].sort((a, b) => a - b);
    let inicio = ordenados[0];
    for (let i = 1; i <= ordenados.length; i++) {
      const atual = ordenados[i];
      const anterior = ordenados[i - 1];
      if (atual !== anterior + 1) {
        faixas.push({ inicio, horario, dias: rotuloDias(inicio, anterior) });
        inicio = atual;
      }
    }
  }

  return faixas
    .sort((a, b) => a.inicio - b.inicio || a.horario.localeCompare(b.horario))
    .map(({ dias, horario }) => ({ dias, horario }));
}

/**
 * Resumo de "Meu perfil": "Elétrica, Hidráulica, Limpeza · raio de 12 km".
 * `null` se o Prestador nunca salvou o perfil de atuação.
 */
export function resumoAtuacao(perfil: PerfilAtuacaoResponse): string | null {
  if (perfil.raioAtendimentoKm === null) {
    return null;
  }
  const raio = `raio de ${perfil.raioAtendimentoKm} km`;
  if (perfil.especialidades.length === 0) {
    return `Nenhuma especialidade · ${raio}`;
  }
  const nomes = perfil.especialidades.map((categoria) => categoria.nome).join(", ");
  return `${nomes} · ${raio}`;
}
