# Claude Code — Project Guide

## Stack

| Concern | Library |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 (dark-first palette) |
| Routing | React Router v6 (lazy routes) |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| HTTP | Axios via `httpClient` wrapper |
| Tests | Vitest + Testing Library |
| Icons | Lucide React |

## Architecture — four layers

```
src/
  domain/          Pure TypeScript — models, errors, value objects. No React, no libs.
  application/     Use-cases: services (plain objects) + React Query hooks.
  infrastructure/  API adapters, HTTP client, token/session storage.
  presentation/    React components, pages, layouts, routes.
  shared/          Cross-layer utilities, hooks, constants (no domain logic).
  app/             App shell: providers, router, global config.
```

**Dependency rule:** `domain` ← `application` ← `infrastructure` ← `presentation`.  
A layer may only import from layers to its left. `shared/` is available to all.

## Path aliases (configured in `tsconfig.app.json` + `vite.config.ts`)

```
@domain/         → src/domain/
@application/    → src/application/
@infrastructure/ → src/infrastructure/
@presentation/   → src/presentation/
@shared/         → src/shared/
@app/            → src/app/
```

## Key conventions

- **UI components** live in `src/presentation/components/ui/`. Use `React.forwardRef`, named exports, `cn()` for class merging, variant/size Record maps. See `Button.tsx` as the canonical example.
- **Domain models** are pure interfaces with `readonly` fields and pure helper functions. No side effects.
- **Application services** are plain objects (`export const fooService = { ... }`). They orchestrate domain + infrastructure. No React.
- **React Query hooks** own all server state. No `useEffect` + `useState` for data fetching.
- **Infrastructure APIs** always have a `if (appConfig.useMockApi)` branch for local dev.
- **Styles** are Tailwind only — no inline `style` props, no CSS modules. Dark palette: bg `slate-950`, text `slate-200/400`, accent `brand-*`.

## Available slash commands

| Command | Purpose |
|---|---|
| `/new-component <Name>` | Scaffold a new UI component + test |
| `/new-feature <name>` | Scaffold a full feature across all four layers |
| `/review-ui <path>` | Review a component/page for quality, a11y, and architecture |

## Dev workflow

```bash
npm run dev          # start Vite dev server
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
npm run test         # Vitest (watch)
npm run test:coverage
npm run build        # production build
```

## Mock API

Set `VITE_USE_MOCK_API=true` in `.env.local` (default in dev).  
Mock credentials: `admin@example.com / password123` or `user@example.com / password123`.
