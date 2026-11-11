import { useEffect, useRef } from "react";

import { useEnderecoPorCepQuery } from "../servico/cep.queries";
import type { EnderecoPorCep } from "../servico/cep.api";

/**
 * Busca de CEP (ViaCEP) pra preencher o resto do endereço — cadastro de conta,
 * "Novo endereço" e endereço avulso do anúncio. Nunca bloqueia o formulário:
 * só informa `carregando`/`erro`, quem usa decide como mostrar.
 *
 * @param cep valor digitado no campo, com ou sem máscara
 * @param aoEncontrar chamado uma vez por CEP de 8 dígitos que o ViaCEP resolveu
 */
export function useBuscaCep(cep: string, aoEncontrar: (endereco: EnderecoPorCep) => void) {
  const digitos = cep.replace(/\D/g, "");
  const query = useEnderecoPorCepQuery(digitos);
  const ultimoAplicado = useRef<string | null>(null);

  useEffect(() => {
    if (digitos.length !== 8) {
      ultimoAplicado.current = null;
      return;
    }
    if (query.data && ultimoAplicado.current !== digitos) {
      ultimoAplicado.current = digitos;
      aoEncontrar(query.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `aoEncontrar` não precisa ser estável: só dispara por CEP novo
  }, [digitos, query.data]);

  const completo = digitos.length === 8;
  return {
    carregando: completo && query.isPending,
    erro: !completo
      ? null
      : query.isError
        ? "Não foi possível buscar o CEP. Preencha manualmente."
        : query.isSuccess && query.data === null
          ? "CEP não encontrado. Preencha o endereço manualmente."
          : null,
  };
}
