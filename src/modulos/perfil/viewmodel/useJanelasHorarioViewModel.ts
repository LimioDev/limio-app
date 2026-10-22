import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useRascunhoAtuacao } from "../store/rascunhoAtuacao.store";
import { JanelasFormSchema, type JanelasForm } from "../tipos/atuacao.types";
import { DIAS_SEMANA, rotuloDia } from "../tipos/perfil.enums";

const INICIO_PADRAO = "08:00";
const FIM_PADRAO = "18:00";

/**
 * Editor das janelas de horário: um horário por dia, ligado ou não. A API
 * aceita mais de uma janela por dia, mas o app só edita a primeira de cada
 * dia (não há desenho pra mais).
 */
export function useJanelasHorarioViewModel() {
  const router = useRouter();
  const definirJanelas = useRascunhoAtuacao((estado) => estado.definirJanelas);

  // Lê o rascunho uma vez, ao abrir: o editor é independente até "Salvar".
  const [valoresIniciais] = useState<JanelasForm>(() => {
    const janelas = useRascunhoAtuacao.getState().rascunho?.janelas ?? [];
    return {
      dias: DIAS_SEMANA.map((diaSemana) => {
        const janela = janelas.find((j) => j.diaSemana === diaSemana);
        return {
          diaSemana,
          ativo: Boolean(janela),
          horaInicio: janela?.horaInicio ?? INICIO_PADRAO,
          horaFim: janela?.horaFim ?? FIM_PADRAO,
        };
      }),
    };
  });

  const form = useForm<JanelasForm>({
    resolver: zodResolver(JanelasFormSchema),
    defaultValues: valoresIniciais,
  });

  const dias = useWatch({ control: form.control, name: "dias" });

  const aoSalvar = form.handleSubmit((dados) => {
    definirJanelas(
      dados.dias
        .filter((dia) => dia.ativo)
        .map(({ diaSemana, horaInicio, horaFim }) => ({ diaSemana, horaInicio, horaFim })),
    );
    router.back();
  });

  return {
    control: form.control,
    erros: form.formState.errors,
    dias: dias.map((dia) => ({ rotulo: rotuloDia(dia.diaSemana), ativo: dia.ativo })),
    aoSalvar,
    aoVoltar: () => router.back(),
  };
}
