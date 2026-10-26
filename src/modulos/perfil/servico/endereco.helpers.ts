import {
  CAMPO_ENDERECO_DA_API,
  CAMPOS_ENDERECO_VAZIOS,
  formatarCep,
  paraCamposRequest,
} from "../../../comum/lib/endereco";
import { errosPorCampo as separarErrosPorCampo } from "../../../comum/lib/erros";
import type {
  EnderecoSalvoRequest,
  EnderecoSalvoResponse,
} from "../../../comum/tipos/endereco";
import type {
  CampoEnderecoForm,
  EnderecoForm,
  EnderecoFormEntrada,
} from "../tipos/endereco.types";

/** "Pinheiros · São Paulo · SP". */
export function linhaLocal(endereco: EnderecoSalvoResponse): string {
  return `${endereco.bairroRegiao} · ${endereco.cidade} · ${endereco.uf}`;
}

/** Resumo da linha "Endereços salvos" em "Meu perfil": "2 endereços · Casa é o padrão". */
export function resumoEnderecos(enderecos: EnderecoSalvoResponse[]): string {
  if (enderecos.length === 0) {
    return "Nenhum endereço salvo";
  }
  const quantidade =
    enderecos.length === 1 ? "1 endereço" : `${enderecos.length} endereços`;
  const padrao = enderecos.find((e) => e.isPadrao);
  return padrao ? `${quantidade} · ${padrao.apelido} é o padrão` : quantidade;
}

export const FORMULARIO_VAZIO: EnderecoFormEntrada = {
  apelido: "",
  ...CAMPOS_ENDERECO_VAZIOS,
  isPadrao: false,
};

export function paraFormulario(endereco: EnderecoSalvoResponse): EnderecoFormEntrada {
  return {
    apelido: endereco.apelido,
    cep: formatarCep(endereco.cep),
    cidade: endereco.cidade,
    uf: endereco.uf,
    rua: endereco.rua,
    numero: endereco.numero,
    complemento: endereco.complemento ?? "",
    bairro: endereco.bairroRegiao,
    isPadrao: endereco.isPadrao,
  };
}

export function paraRequest(form: EnderecoForm): EnderecoSalvoRequest {
  return {
    apelido: form.apelido,
    ...paraCamposRequest(form),
    isPadrao: form.isPadrao,
  };
}

/** Nome do campo no `EnderecoSalvoRequest` da API → campo do formulário. */
const CAMPO_DA_API: Record<string, CampoEnderecoForm> = {
  apelido: "apelido",
  ...CAMPO_ENDERECO_DA_API,
};

/** Erros por campo do `VALIDACAO_FALHOU` do `POST`/`PUT` de endereço. */
export function errosPorCampo(mensagem: string): Partial<Record<CampoEnderecoForm, string>> {
  return separarErrosPorCampo(mensagem, CAMPO_DA_API);
}
