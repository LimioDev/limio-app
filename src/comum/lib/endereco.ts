import type {
  CamposEnderecoForm,
  CamposEnderecoFormEntrada,
  CamposEnderecoRequest,
} from "../tipos/endereco";

/** "05407002" → "05407-002". Fora de 8 dígitos devolve como veio. */
export function formatarCep(cep: string): string {
  const digitos = cep.replace(/\D/g, "");
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : cep;
}

/** "R. Cardeal Arcoverde, 1424 · ap 82". */
export function linhaLogradouro(endereco: {
  rua: string;
  numero: string;
  complemento: string | null;
}): string {
  const base = `${endereco.rua}, ${endereco.numero}`;
  return endereco.complemento ? `${base} · ${endereco.complemento}` : base;
}

export const CAMPOS_ENDERECO_VAZIOS: CamposEnderecoFormEntrada = {
  cep: "",
  cidade: "",
  uf: null,
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
};

/** Campos do formulário → campos da requisição (bairro vira `bairroRegiao`, complemento vazio vira `null`). */
export function paraCamposRequest(form: CamposEnderecoForm): CamposEnderecoRequest {
  return {
    cep: form.cep,
    rua: form.rua,
    numero: form.numero,
    complemento: form.complemento || null,
    bairroRegiao: form.bairro,
    cidade: form.cidade,
    uf: form.uf,
  };
}

/** Nome do campo de endereço na API → campo do formulário. A UF aparece junto da cidade. */
export const CAMPO_ENDERECO_DA_API: Record<string, keyof CamposEnderecoFormEntrada> = {
  cep: "cep",
  rua: "rua",
  numero: "numero",
  complemento: "complemento",
  bairroRegiao: "bairro",
  cidade: "cidade",
  uf: "cidade",
};
