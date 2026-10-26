import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Mask } from "react-native-mask-input";

import { Botao } from "../../../comum/componentes/ui/Botao";
import { Campo } from "../../../comum/componentes/ui/Campo";
import { Interruptor } from "../../../comum/componentes/ui/Interruptor";
import type { JanelasForm } from "../tipos/atuacao.types";
import { CabecalhoVoltar } from "../../../comum/componentes/ui/CabecalhoVoltar";

const MASCARA_HORA: Mask = [/\d/, /\d/, ":", /\d/, /\d/];

interface JanelasHorarioViewProps {
  control: Control<JanelasForm>;
  erros: FieldErrors<JanelasForm>;
  dias: { rotulo: string; ativo: boolean }[];
  aoSalvar: () => void;
  aoVoltar: () => void;
}

export function JanelasHorarioView({
  control,
  erros,
  dias,
  aoSalvar,
  aoVoltar,
}: JanelasHorarioViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-fundo" edges={["top", "bottom"]}>
      <CabecalhoVoltar titulo="Janelas de horário" aoVoltar={aoVoltar} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-margem pb-6 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-rotulo text-tinta-suave">
          Escolha os dias e horários em que você atende.
        </Text>

        {dias.map((dia, indice) => (
          <View
            key={dia.rotulo}
            className="gap-3 rounded-campo border border-borda bg-superficie p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-corpo font-semibold text-tinta">{dia.rotulo}</Text>
              <Controller
                control={control}
                name={`dias.${indice}.ativo`}
                render={({ field }) => (
                  <Interruptor
                    ligado={field.value}
                    aoAlternar={field.onChange}
                    rotuloAcessivel={`Atender na ${dia.rotulo.toLowerCase()}`}
                  />
                )}
              />
            </View>

            {dia.ativo ? (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name={`dias.${indice}.horaInicio`}
                    render={({ field }) => (
                      <Campo
                        rotulo="Início"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        erro={erros.dias?.[indice]?.horaInicio?.message}
                        mask={MASCARA_HORA}
                        keyboardType="number-pad"
                        placeholder="08:00"
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name={`dias.${indice}.horaFim`}
                    render={({ field }) => (
                      <Campo
                        rotulo="Fim"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        erro={erros.dias?.[indice]?.horaFim?.message}
                        mask={MASCARA_HORA}
                        keyboardType="number-pad"
                        placeholder="18:00"
                      />
                    )}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View className="border-t border-borda bg-superficie px-margem py-4">
        <Botao rotulo="Salvar horários" onPress={aoSalvar} />
      </View>
    </SafeAreaView>
  );
}
