import { api } from "../../../comum/lib/api";
import { formDataComFoto } from "../../../comum/lib/foto";
import type { ArquivoFoto } from "../../../comum/tipos/foto";
import {
  AlvoDenunciaSchema,
  DenunciaRegistradaSchema,
  RegistrarDenunciaRequestSchema,
  type AlvoDenuncia,
  type DenunciaRegistrada,
  type RegistrarDenunciaRequest,
} from "../tipos/denuncia.types";

/**
 * "Registrar denúncia" (ETI-114, `DenunciaController`): `multipart/form-data`
 * com o alvo, `motivo` e `descricao` como campos e a `foto` opcional. Erros:
 * `400 VALIDACAO_FALHOU`, `404 ALVO_NAO_ACESSIVEL` (alvo inexistente,
 * inacessível ou o próprio usuário) e `422 FOTO_INVALIDA`.
 */
export async function registrarDenuncia({
  alvo,
  request,
  foto,
}: {
  alvo: AlvoDenuncia;
  request: RegistrarDenunciaRequest;
  foto: ArquivoFoto | null;
}): Promise<DenunciaRegistrada> {
  const corpo = foto ? formDataComFoto("foto", foto) : new FormData();
  for (const [campo, valor] of Object.entries(AlvoDenunciaSchema.parse(alvo))) {
    if (valor) {
      corpo.append(campo, valor);
    }
  }
  const { motivo, descricao } = RegistrarDenunciaRequestSchema.parse(request);
  corpo.append("motivo", motivo);
  corpo.append("descricao", descricao);
  const { data } = await api.post("/denuncias", corpo);
  return DenunciaRegistradaSchema.parse(data);
}
