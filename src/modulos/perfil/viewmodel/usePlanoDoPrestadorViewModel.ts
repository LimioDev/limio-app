import { useCotaDoMesQuery } from "../servico/cota.queries";
import { Plano } from "../tipos/cota.enums";

/**
 * Plano do Prestador logado, pra outros módulos decidirem o que mostrar sem
 * importar a camada de serviço do perfil (ADR-0001). `ehGold` é `null`
 * enquanto a cota carrega ou se a consulta falhar: quem usa não deve supor
 * nenhum dos dois planos.
 */
export function usePlanoDoPrestadorViewModel(): { ehGold: boolean | null } {
  const query = useCotaDoMesQuery();
  return { ehGold: query.data ? query.data.plano === Plano.GOLD : null };
}
