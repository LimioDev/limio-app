import type {
  CampoEnderecoForm,
  EnderecoForm,
  EnderecoFormEntrada,
  EnderecoSalvoRequest,
  EnderecoSalvoResponse,
} from "../tipos/endereco.types";

/** "05407002" → "05407-002". Fora de 8 dígitos devolve como veio. */
export function formatarCep(cep: string): string {
  const digitos = cep.replace(/\D/g, "");
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : cep;
}

/** "R. Cardeal Arcoverde, 1424 · ap 82". */
export function linhaLogradouro(endereco: EnderecoSalvoResponse): string {
  const base = `${endereco.rua}, ${endereco.numero}`;
  return endereco.complemento ? `${base} · ${endereco.complemento}` : base;
}

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
  cep: "",
  cidade: "",
  uf: null,
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
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
    cep: form.cep,
    rua: form.rua,
    numero: form.numero,
    complemento: form.complemento || null,
    bairroRegiao: form.bairro,
    cidade: form.cidade,
    uf: form.uf,
    isPadrao: form.isPadrao,
  };
}

/** Nome do campo no `EnderecoSalvoRequest` da API → campo do formulário. */
const CAMPO_DA_API: Record<string, CampoEnderecoForm> = {
  apelido: "apelido",
  cep: "cep",
  rua: "rua",
  numero: "numero",
  complemento: "complemento",
  bairroRegiao: "bairro",
  cidade: "cidade",
  uf: "cidade",
};

/**
 * O `VALIDACAO_FALHOU` da API traz os campos na mensagem, no formato
 * `"cep: CEP deve ter 8 dígitos; rua: rua é obrigatória"`. Separa por campo
 * do formulário; o que não reconhecer fica de fora (a tela mostra a
 * mensagem inteira se nada for reconhecido).
 */
export function errosPorCampo(
  mensagem: string,
): Partial<Record<CampoEnderecoForm, string>> {
  const erros: Partial<Record<CampoEnderecoForm, string>> = {};
  for (const trecho of mensagem.split(";")) {
    const separador = trecho.indexOf(":");
    if (separador < 0) {
      continue;
    }
    const campo = CAMPO_DA_API[trecho.slice(0, separador).trim()];
    const texto = trecho.slice(separador + 1).trim();
    if (campo && texto && !erros[campo]) {
      erros[campo] = texto.charAt(0).toUpperCase() + texto.slice(1);
    }
  }
  return erros;
}
