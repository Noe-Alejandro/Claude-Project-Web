# EnterpriseApp

A production-grade React + TypeScript SPA built with a strict four-layer architecture, dark-first design system, and full mock API for offline development.

## Quick Start

```bash
git clone <repo-url>
cd Claude-Project-Web

npm install

cp .env.example .env.local   # or create manually (see Environment section)
npm run dev                  # → http://localhost:5173
```

**Demo credentials** (mock API, no backend needed):

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin@123!` | Admin — full access |
| `user@example.com` | `User@123!` | User — limited access |

---

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

---

## Project Structure

```
src/
├── domain/          Pure TypeScript — models, errors, value objects. No React, no libs.
├── application/     Use-cases: services (plain objects) + React Query hooks.
├── infrastructure/  API adapters, HTTP client, token/session storage.
├── presentation/    React components, pages, layouts, routes.
├── shared/          Cross-layer utilities, hooks, constants (no domain logic).
└── app/             App shell: providers, router, global config.
```

**Dependency rule:** `domain` ← `application` ← `infrastructure` ← `presentation`

A layer may only import from layers to its left. `shared/` is available to all layers.

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full layer-by-layer deep-dive and a step-by-step guide to adding a new feature.

---

## Environment Variables

Create `.env.local` in the project root:

```env
VITE_APP_NAME=EnterpriseApp
VITE_USE_MOCK_API=true          # set to false to hit a real backend
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

When `VITE_USE_MOCK_API=true` (the default in dev), all HTTP calls are intercepted inside the infrastructure layer — no backend required.

---

## Scripts

```bash
npm run dev              # Vite dev server with HMR
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview the production build locally

npm run type-check       # TypeScript check (no emit)
npm run lint             # ESLint — reports issues
npm run lint:fix         # ESLint — auto-fixes what it can
npm run format           # Prettier — formats all src files
npm run format:check     # Prettier — checks without writing

npm run test             # Vitest (watch mode)
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage report

npm run pre-commit       # Full preflight: format + lint + types + GPU audit
```

### `npm run pre-commit`

This is a real Node.js script (`scripts/pre-commit-check.mjs`) that runs four checks in sequence and exits non-zero if anything fails. Run it before every commit — CI should run it too.

| Check | What it validates |
|---|---|
| **Prettier** | Consistent formatting across all `src/` files |
| **ESLint** | Code quality and React-specific rules (zero warnings allowed) |
| **TypeScript** | Full type check with `--noEmit` |
| **GPU/CSS audit** | Detects rendering anti-patterns that cause browser-level lag |

The GPU audit catches:
- `backdrop-blur-xl` / `backdrop-blur-2xl` on non-overlay elements (very expensive GPU pass)
- Any `backdrop-blur` on `sticky` or `fixed` elements (repaints on every scroll frame)
- 3+ blur usages in the same file (usually means blur inside a repeated component)
- `transition-transform` without `will-change` on large animated elements
- `backdrop-blur` inside `.map()` callbacks (creates N simultaneous GPU compositing layers)

---

## Path Aliases

Configured in `tsconfig.app.json` and `vite.config.ts`. Always use aliases — never relative paths that cross layer boundaries:

```ts
@domain/         → src/domain/
@application/    → src/application/
@infrastructure/ → src/infrastructure/
@presentation/   → src/presentation/
@shared/         → src/shared/
@app/            → src/app/
```

```ts
// Good
import { getUserFullName } from '@domain/models/User'

// Avoid — relative paths that cross layers are easy to get wrong
import { getUserFullName } from '../../../domain/models/User'
```

---

## Claude Skills (AI Developer Tools)

This project ships Claude Code skills in `.claude/skills/`. Any developer with [Claude Code](https://claude.ai/code) can use them by typing the command in the chat.

| Command | What it does |
|---|---|
| `/pre-commit` | Runs `npm run pre-commit` — full preflight before committing |
| `/pr-review` | Diffs current branch vs `main`, reviews for bugs, security issues, performance problems, and architecture violations |
| `/new-component <Name>` | Scaffolds a UI component + test following project conventions |
| `/new-feature <name>` | Scaffolds a full feature across all four layers |
| `/review-ui <path>` | Reviews a component/page for quality, accessibility, and architecture |

---

## Testing

Tests live in `__tests__/` directories alongside the code they cover. Domain and application layers are the priority — they contain the business logic worth protecting.

```bash
npm run test             # watch mode
npm run test:coverage    # generates coverage/index.html
```

---

## Contributing

1. Branch off `main`: `git checkout -b feat/your-feature`
2. Follow the [architecture rules](./ARCHITECTURE.md) — especially the dependency rule
3. Run `npm run pre-commit` — all four checks must pass
4. Use `/pr-review` in Claude Code for an AI review of your diff before opening a PR
5. Open a PR against `main`
