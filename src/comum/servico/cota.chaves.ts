/**
 * Chave da cota do mês do Prestador (`GET /perfil/prestador/cota`). Fica em
 * `comum/` porque dois módulos usam: `perfil` consulta (faixa do mural e tela
 * 33) e `financeiro` invalida depois de assinar o GOLD.
 */
export const chavesCota = {
  mes: ["perfil", "cota"] as const,
};
