export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Mesmo algoritmo de dígito verificador usado em `CpfValidator` no backend. */
export function cpfValido(cpf: string): boolean {
  const digitos = somenteDigitos(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const calcularDigito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(digitos[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    calcularDigito(9) === Number(digitos[9]) &&
    calcularDigito(10) === Number(digitos[10])
  );
}

/** Converte "dd/mm/aaaa" pro formato ISO ("aaaa-mm-dd") que o backend espera em `LocalDate`. */
export function dataBrParaIso(dataBr: string): string | null {
  const digitos = somenteDigitos(dataBr);
  if (digitos.length !== 8) {
    return null;
  }
  const dia = digitos.slice(0, 2);
  const mes = digitos.slice(2, 4);
  const ano = digitos.slice(4, 8);
  return `${ano}-${mes}-${dia}`;
}

export function dataBrValida(dataBr: string): boolean {
  const iso = dataBrParaIso(dataBr);
  if (!iso) {
    return false;
  }
  const data = new Date(`${iso}T00:00:00`);
  const [ano, mes, dia] = iso.split("-").map(Number);
  return (
    data.getFullYear() === ano &&
    data.getMonth() + 1 === mes &&
    data.getDate() === dia
  );
}

export function maiorDeIdade(dataBr: string, idadeMinima = 18): boolean {
  if (!dataBrValida(dataBr)) {
    return false;
  }
  const iso = dataBrParaIso(dataBr)!;
  const nascimento = new Date(`${iso}T00:00:00`);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aniversarioJaPassouEsteAno =
    hoje.getMonth() > nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() >= nascimento.getDate());
  if (!aniversarioJaPassouEsteAno) {
    idade -= 1;
  }
  return idade >= idadeMinima;
}
