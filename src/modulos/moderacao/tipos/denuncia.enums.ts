/** Motivos da denúncia (`MotivoDenuncia` no back, ETI-114). O texto exibido fica no app. */
export const MotivoDenuncia = {
  NAO_PAGOU_VALOR_COMBINADO: "NAO_PAGOU_VALOR_COMBINADO",
  SERVICO_NAO_REALIZADO: "SERVICO_NAO_REALIZADO",
  COMPORTAMENTO_INADEQUADO: "COMPORTAMENTO_INADEQUADO",
  SUSPEITA_DE_FRAUDE: "SUSPEITA_DE_FRAUDE",
  OUTRO_MOTIVO: "OUTRO_MOTIVO",
} as const;

export type MotivoDenuncia = (typeof MotivoDenuncia)[keyof typeof MotivoDenuncia];

/** Na ordem da tela 46. */
export const MOTIVOS_DENUNCIA: readonly MotivoDenuncia[] = Object.values(MotivoDenuncia);

export function rotuloMotivoDenuncia(motivo: MotivoDenuncia): string {
  switch (motivo) {
    case MotivoDenuncia.NAO_PAGOU_VALOR_COMBINADO:
      return "Não pagou o valor combinado";
    case MotivoDenuncia.SERVICO_NAO_REALIZADO:
      return "Serviço não foi realizado";
    case MotivoDenuncia.COMPORTAMENTO_INADEQUADO:
      return "Comportamento inadequado";
    case MotivoDenuncia.SUSPEITA_DE_FRAUDE:
      return "Suspeita de fraude";
    case MotivoDenuncia.OUTRO_MOTIVO:
      return "Outro motivo";
  }
}

