# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Git commits

Never add `Co-Authored-By: Claude` or `Claude-Session:` trailers, or any other Claude/Anthropic attribution, to commit messages in this repo. Commits must show only the human author.

# Arquitetura modular — instruções pra qualquer agente de IA (Claude, Codex, Cursor, Grok, etc.)

Decisão registrada em ADR-0001. Origem completa em
`docs/adr/0001-arquitetura-modular-backend-frontend.md` no diretório pai do
workspace (`limio/docs/`, fora deste repo — não é lido por quem clona só
`limio-app`, por isso o resumo abaixo é autocontido). Claude também tem a versão
completa como skill em `.claude/skills/limio-architecture/SKILL.md`.

Padrão: **MVVM via Container-Presenter com custom hooks**, equivalentes TS aos
conceitos Java do backend (union type/const object no lugar de `enum`, schema Zod
+ `z.infer` no lugar de `record`). Todo módulo/tela novo replica exatamente esta
estrutura.

## Split raiz: `comum/` vs `modulos/`

```
limio-app/
├── app/          <- Expo Router: SÓ rotas finas (Container)
└── src/
    ├── comum/    <- compartilhado entre módulos
    └── modulos/  <- um módulo por entidade/domínio, SEM EXCEÇÃO — inclusive auth
```

`auth` é módulo como qualquer outro. "Usuário logado" vem de
`comum/store/sessao.ts` (Zustand, populado pelo módulo `auth` no login) — nunca
importa arquivo de dentro de `modulos/auth/`. Critério pra subir pra `comum/`:
usado por 2+ módulos **hoje**.

`comum/` tem: `componentes/ui/` (design system puro), `lib/` (`api.ts` axios,
`datas.ts`, `query.ts`), `store/` (`sessao.ts`), `hooks/` (técnico reaproveitável,
ex. `useDebounce`), `tipos/` (`PaginaResponse<T>`, `ErroResponse`, `erros.ts` —
`CodigoErro` espelha 1:1 o enum do backend).

## Camadas MVVM dentro de um módulo (`src/modulos/<entidade>/`)

| Camada | Pasta | Equivalente backend |
|---|---|---|
| Model | `tipos/` + `servico/` | `entity`/`records` + `repository` |
| ViewModel | `viewmodel/` — hook `use<Entidade>ViewModel` | `usecase` |
| View (Presenter) | `view/` — componente burro, só props+render | `controller` |
| Container | rota em `app/` — arquivo fino | `controller` (fiação HTTP) |

```
src/modulos/<entidade>/
├── tipos/<entidade>.enums.ts     <- union + const object (NÃO enum nativo do TS)
├── tipos/<entidade>.types.ts     <- schema Zod + z.infer (equivalente de record)
├── servico/<entidade>.api.ts     <- chamada axios crua + schema.parse() na fronteira
├── servico/<entidade>.queries.ts <- hooks React Query
├── viewmodel/use<Entidade>ViewModel.ts
└── view/<Entidade>View.tsx
```

## Regras fixas de dependência

- `modulos/*` só importa de `comum/`. Nunca de outro módulo, inclusive `auth`.
- `app/*` só importa `viewmodel`+`view` de `modulos/*` e componentes de `comum/`.
  Zero lógica de negócio em `app/`.

## Convenções de tipo

- Enum de domínio → `const { ... } as const` + `type X = typeof X[keyof typeof X]`,
  nunca `enum` nativo do TS.
- DTO vindo da API → schema Zod + `z.infer`, `.parse()` sempre dentro de
  `servico/`, nunca dentro de `view`. (`zod` precisa estar no `package.json`.)

Detalhe completo (exemplos de código, fluxo de tela ponta a ponta, glossário de
pastas, checklist passo a passo pra criar módulo novo): ver
`.claude/skills/limio-architecture/SKILL.md` neste repo.
