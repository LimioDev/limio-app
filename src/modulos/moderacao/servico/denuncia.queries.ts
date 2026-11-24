import { useMutation } from "@tanstack/react-query";

import { registrarDenuncia } from "./denuncia.api";

/** A denúncia não muda nada do serviço (ETI-114): nenhuma consulta a recarregar. */
export function useRegistrarDenunciaMutation() {
  return useMutation({ mutationFn: registrarDenuncia });
}
