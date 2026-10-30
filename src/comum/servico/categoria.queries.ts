import { useQuery } from "@tanstack/react-query";

import { listarCategorias } from "./categoria.api";

export const chavesCategoria = {
  lista: ["categorias"] as const,
};

export function useCategoriasQuery() {
  return useQuery({
    queryKey: chavesCategoria.lista,
    queryFn: listarCategorias,
  });
}
