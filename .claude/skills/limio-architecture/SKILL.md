---
name: limio-architecture
description: Arquitetura modular do limio-app — comum/ vs modulos/, MVVM via Container-Presenter (view/viewmodel/servico/tipos por módulo), enum como union+const object, record como schema Zod + z.infer. Fonte: ADR-0001. Use sempre que for criar/mover tela, hook, tipo ou chamada de API neste projeto.
---

# Arquitetura modular — limio-app

Decisão registrada em ADR-0001: **MVVM (Model-View-ViewModel) via Container-Presenter
com custom hooks**, mapeando em TypeScript os mesmos conceitos do backend Java
(union type/const object no lugar de `enum`, `type` de schema Zod no lugar de
`record`). Todo módulo novo replica exatamente esta estrutura.

## Split raiz: `comum/` vs `modulos/`

```
limio-app/
├── app/          <- Expo Router: SÓ rotas finas (fazem o papel de Container)
└── src/
    ├── comum/    <- compartilhado entre módulos (era o `src/*` solto)
    └── modulos/  <- um módulo por entidade/domínio, SEM EXCEÇÃO — inclusive auth
```

`auth` é módulo como qualquer outro. Quem precisa saber "usuário logado" lê de
`comum/store/sessao.ts` (populado pelo módulo `auth` no login) — nunca importa
arquivo de dentro de `modulos/auth/`.

**Critério pra algo subir pra `comum/`:** só quando usado por 2+ módulos **hoje**.

### Dentro de `comum/`

| Pasta | Contém |
|---|---|
| `componentes/ui/` | Design system puro, sem noção de entidade: `Botao`, `Campo`, `Card`, `Badge`, `Carregando`, `Vazio` |
| `lib/` | Infra técnica: `api.ts` (instância axios), `datas.ts`, `query.ts` (QueryClient) |
| `store/` | Estado global usado por mais de um módulo: `sessao.ts` (Zustand — token, usuário logado, papel) |
| `hooks/` | Hook técnico reaproveitável sem regra de negócio: `useDebounce`, `useKeyboardVisible` |
| `tipos/` | Contrato genérico: `PaginaResponse<T>`, `ErroResponse`, `erros.ts` (`CodigoErro` — espelha 1:1 o enum do backend) |

## Camadas MVVM dentro de um módulo (`src/modulos/<entidade>/`)

| Camada | Pasta | Responsabilidade | Equivalente backend |
|---|---|---|---|
| Model | `tipos/` + `servico/` | Tipos/schemas + chamadas de API/React Query | `entity`/`records` + `repository` |
| ViewModel | `viewmodel/` | Custom hook `use<Entidade>ViewModel`: estado, chama `servico/`, expõe `{dados, carregando, erro, handlers}` | `usecase` |
| View (Presenter) | `view/` | Componente burro: só props + render, sem fetch/useState de negócio | `controller` |
| Container | rota em `app/` | Arquivo fino: `const vm = useXViewModel(); return <XView {...vm} />` | `controller` (fiação HTTP) |

```
src/modulos/<entidade>/
├── tipos/
│   ├── <entidade>.enums.ts    <- union + const object (NÃO enum nativo do TS)
│   └── <entidade>.types.ts    <- schema Zod + `z.infer` (equivalente de record)
├── servico/
│   ├── <entidade>.api.ts      <- chamada axios crua + schema.parse() na fronteira
│   └── <entidade>.queries.ts  <- hooks React Query (useXQuery, useXMutation)
├── viewmodel/
│   └── use<Entidade>ViewModel.ts
└── view/
    ├── <Entidade>View.tsx
    └── componentes/            <- subcomponentes só usados dentro do módulo
```

## Regras fixas de dependência

- `modulos/*` só importa de `comum/`. Nunca de outro módulo — inclusive `auth`.
- `app/*` só importa `viewmodel` + `view` de `modulos/*` (e componentes de `comum/`).
  Zero lógica de negócio dentro de `app/`.

## Equivalente de `enum` — union + const object

Evitar `enum` nativo do TS (peso extra no bundle, comportamento estranho com
`--isolatedModules`):

```ts
// modulos/servico/tipos/servico.enums.ts
export const StatusServico = {
  PENDENTE: "PENDENTE",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDO: "CONCLUIDO",
} as const;

export type StatusServico = (typeof StatusServico)[keyof typeof StatusServico];

function rotuloStatus(status: StatusServico): string {
  switch (status) {
    case StatusServico.PENDENTE: return "Pendente";
    case StatusServico.EM_ANDAMENTO: return "Em andamento";
    case StatusServico.CONCLUIDO: return "Concluído";
    // sem default: novo valor no union = erro de compilação (checagem exaustiva)
  }
}
```

## Equivalente de `record` — schema Zod no limite do módulo

Validação de invariante na fronteira de rede, sempre dentro de `servico/`, nunca
dentro de `view`:

```ts
// modulos/servico/tipos/servico.types.ts
import { z } from "zod";
import { StatusServico } from "./servico.enums";

export const ServicoResponseSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  status: z.nativeEnum(StatusServico),
  criadoEm: z.string().datetime(),
});

export type ServicoResponse = z.infer<typeof ServicoResponseSchema>;
```

```ts
// modulos/servico/servico/servico.api.ts
export async function buscarServico(id: string): Promise<ServicoResponse> {
  const { data } = await api.get(`/servicos/${id}`);
  return ServicoResponseSchema.parse(data); // payload inválido explode aqui, não na View
}
```

> `zod` precisa estar no `package.json` pra este padrão funcionar — checar antes de
> assumir presente.

## Fluxo de uma tela ponta a ponta (detalhe de serviço como referência)

1. `app/(app)/servico/[id].tsx` (Container) lê `id` da rota, chama
   `const vm = useServicoDetalheViewModel(id)`.
2. `useServicoDetalheViewModel` (ViewModel) chama `useServicoQuery(id)` de
   `servico.queries.ts` (React Query).
3. `useServicoQuery` chama `buscarServico(id)` — resposta passa por
   `ServicoResponseSchema.parse`, garantindo que o ViewModel só recebe dado no
   formato esperado.
4. ViewModel deriva estado de apresentação (`carregando`, `erro`, `podeEditar`
   calculado a partir do enum + `sessao` do Zustand) e retorna objeto plano.
5. Container passa esse objeto pra `ServicoDetalheView` (Presenter) — a View testa
   unitário de renderização, sem mock de rede.

## Checklist ao criar um módulo/tela novo

1. `src/modulos/<entidade>/{tipos,servico,viewmodel,view}/`.
2. `tipos/<entidade>.enums.ts` (union+const) e `<entidade>.types.ts` (schema Zod +
   `z.infer`) — nunca `interface`/`type` solto sem schema pra dado vindo da API.
3. `servico/<entidade>.api.ts` (chamada crua + `.parse()`) e
   `<entidade>.queries.ts` (React Query).
4. `viewmodel/use<Entidade>ViewModel.ts` — só esse arquivo tem `useState`/lógica de
   apresentação da tela.
5. `view/<Entidade>View.tsx` — componente puro, testável com `renderHook`/RTL sem
   mock de rede.
6. Rota em `app/` — arquivo fino, só monta `viewmodel` + `view`.
7. Precisa de código de outro módulo? Não importa direto — passa por `comum/`.
