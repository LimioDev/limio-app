import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BackHandler } from "react-native";

import { erroApi, errosPorCampo, mensagemErroApi } from "../../../comum/lib/erros";
import { TipoToast, useToast } from "../../../comum/store/toast";
import { CodigoErro } from "../../../comum/tipos/erros";
import { paraTrocarCartaoRequest, rotuloCartao } from "../servico/gold.helpers";
import { useTrocarCartaoMutation } from "../servico/gold.queries";
import { CartaoFormSchema, type CartaoForm } from "../tipos/gold.types";

const VAZIO: CartaoForm = {
  nomeTitular: "",
  numero: "",
  validade: "",
  cvv: "",
  cpf: "",
  email: "",
  telefone: "",
  cep: "",
  numeroEndereco: "",
};

/** Nome do campo no `VALIDACAO_FALHOU` da API → campo do formulário. */
const CAMPO_DA_API: Readonly<Record<string, keyof CartaoForm>> = {
  holderName: "nomeTitular",
  holderNome: "nomeTitular",
  numero: "numero",
  expiryMonth: "validade",
  expiryYear: "validade",
  ccv: "cvv",
  holderCpf: "cpf",
  holderEmail: "email",
  holderTelefone: "telefone",
  holderCep: "cep",
  holderNumeroEndereco: "numeroEndereco",
};

/**
 * Tela "Cartão" (ETI-84): cadastra ou troca o cartão da assinatura GOLD. Os
 * dados vão para a API, que tokeniza no gateway e deixa o cartão novo ativo;
 * o app não guarda nada. Abre pelo "Trocar" das telas 34 e 35 e pelo
 * "Adicionar" da 34. Em qualquer falha o cartão anterior continua.
 */
export function useCartaoGoldViewModel() {
  const router = useRouter();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const trocar = useTrocarCartaoMutation();
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  // Trava desde o toque: um toque duplo mandaria o cartão duas vezes.
  const enviando = useRef(false);

  const form = useForm<CartaoForm>({
    resolver: zodResolver(CartaoFormSchema),
    defaultValues: VAZIO,
  });

  const pendente = trocar.isPending;

  // Durante o envio o voltar do Android não fecha: o resultado decide.
  useEffect(() => {
    if (!pendente) {
      return;
    }
    const assinatura = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => assinatura.remove();
  }, [pendente]);

  const enviar = (valores: CartaoForm) => {
    if (enviando.current) {
      return;
    }
    enviando.current = true;
    setErroServidor(null);
    trocar.mutate(paraTrocarCartaoRequest(valores), {
      onSuccess: (cartao) => {
        mostrarToast(`Cartão ${rotuloCartao(cartao)} salvo.`, TipoToast.SUCESSO);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(app)/conta/assinatura-gold");
        }
      },
      onError: (falha) => {
        enviando.current = false;
        const erro = erroApi(falha);
        switch (erro?.codigo) {
          case CodigoErro.CARTAO_INVALIDO:
            setErroServidor(`${erro.mensagem} Seu cartão anterior continua ativo.`);
            return;
          case CodigoErro.GATEWAY_INDISPONIVEL:
            setErroServidor(
              "Não foi possível salvar o cartão agora. Seu cartão anterior continua ativo.",
            );
            return;
          case CodigoErro.VALIDACAO_FALHOU: {
            const porCampo = errosPorCampo(erro.mensagem, CAMPO_DA_API);
            const campos = Object.entries(porCampo) as [keyof CartaoForm, string][];
            if (campos.length === 0) {
              setErroServidor(erro.mensagem);
            }
            for (const [campo, mensagem] of campos) {
              form.setError(campo, { message: mensagem });
            }
            return;
          }
          default:
            setErroServidor(mensagemErroApi(falha, "Não foi possível salvar o cartão."));
        }
      },
    });
  };

  return {
    control: form.control,
    erros: form.formState.errors,
    erroServidor,
    salvando: pendente,
    aoSalvar: () => void form.handleSubmit(enviar)(),
    aoVoltar: () => {
      if (pendente) {
        return;
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/conta/assinatura-gold");
      }
    },
  };
}

export type CartaoGoldViewModel = ReturnType<typeof useCartaoGoldViewModel>;
