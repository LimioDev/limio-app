import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useCadastroEmAndamento } from "../store/cadastroEmAndamento.store";

const DURACAO_COOLDOWN_SEGUNDOS = 42;
const TAMANHO_CODIGO = 6;

export function useVerificarCelularViewModel() {
  const router = useRouter();
  const celular = useCadastroEmAndamento((estado) => estado.celular);
  const confirmarTelefone = useCadastroEmAndamento(
    (estado) => estado.confirmarTelefone,
  );

  const [codigo, setCodigo] = useState("");
  const [segundosRestantes, setSegundosRestantes] = useState(
    DURACAO_COOLDOWN_SEGUNDOS,
  );

  useEffect(() => {
    if (segundosRestantes <= 0) {
      return;
    }
    const id = setInterval(() => {
      setSegundosRestantes((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [segundosRestantes]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const cooldownFormatado = `${minutos}:${segundos.toString().padStart(2, "0")}`;

  return {
    celular,
    codigo,
    aoAlterarCodigo: setCodigo,
    codigoCompleto: codigo.length === TAMANHO_CODIGO,
    podeReenviar: segundosRestantes <= 0,
    cooldownFormatado,
    aoReenviar: () => setSegundosRestantes(DURACAO_COOLDOWN_SEGUNDOS),
    aoTrocarNumero: () => router.replace("/(auth)/cadastro"),
    aoConfirmar: () => {
      confirmarTelefone();
      router.push("/(auth)/confirmar-email");
    },
    aoVoltar: () => router.back(),
  };
}
