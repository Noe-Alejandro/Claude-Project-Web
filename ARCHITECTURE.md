# Architecture

This project follows a strict four-layer architecture inspired by Clean Architecture and Domain-Driven Design. The goal is to keep business logic isolated from UI, framework, and network concerns — making the codebase testable, replaceable, and predictable.

---

## The Four Layers

```
src/
├── domain/          Layer 1 — Pure business logic
├── application/     Layer 2 — Use-cases and orchestration
├── infrastructure/  Layer 3 — External world (HTTP, storage)
├── presentation/    Layer 4 — React UI
├── shared/          Available to all layers (utilities only)
└── app/             App shell (providers, router, config)
```

### Dependency Rule

```
domain  ←  application  ←  infrastructure  ←  presentation
```

- Each layer can only import from layers **to its left**
- `shared/` is available to all layers
- `presentation` **never** imports from `infrastructure` directly
- `domain` imports **nothing** from this project

Violations of this rule make code hard to test and prone to cascading changes.

---

## Layer 1 — Domain

**Location:** `src/domain/`

**What lives here:** Pure TypeScript. Models, value objects, error types, and pure helper functions. No React, no Axios, no external libraries.

**Rules:**
- Interfaces have `readonly` fields — domain objects are immutable
- Helper functions are pure (no side effects, no async)
- No `import` from any other layer

**Examples:**

```ts
// src/domain/models/User.ts
export interface User {
  readonly id: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly role: UserRole
  readonly avatarUrl: string | null
  readonly createdAt: string
  readonly lastLoginAt: string | null
}

// Pure helper — no side effects
export const getUserFullName = (user: Pick<User, 'firstName' | 'lastName'>): string =>
  `${user.firstName} ${user.lastName}`.trim()

export const isAdmin = (user: Pick<User, 'role'>): boolean => user.role === 'admin'
```

```ts
// src/domain/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
  ) { ... }
}
```

**When to add something here:** Any time you're modelling a concept that exists in the business domain (User, Order, Permission), defining what can go wrong (ErrorCode), or writing a calculation that has nothing to do with the network or UI.

---

## Layer 2 — Application

**Location:** `src/application/`

**What lives here:** Use-cases. Two kinds of files:

1. **Services** — plain objects that orchestrate domain + infrastructure calls. No React.
2. **React Query hooks** — the bridge between services and the UI. Own all server state.

**Rules:**
- Services are plain objects: `export const fooService = { ... }`
- No `useEffect` + `useState` for data fetching — use React Query hooks
- Services import from `domain` and `infrastructure`. Hooks import from services.

**Service example:**

```ts
// src/application/auth/AuthService.ts
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await authApi.login(credentials)        // infrastructure
    tokenStorage.setAccessToken(response.accessToken, ...)   // infrastructure
    return { user: response.user, expiresAt }                // domain shape
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clearAccessToken()   // always clean up, even if server call fails
    }
  },
}
```

**React Query hook example:**

```ts
// src/application/users/useUserQueries.ts
export const useUsersQuery = (page: number) =>
  useQuery({
    queryKey: queryKeys.users.list(page),
    queryFn: () => usersApi.list(page),
  })

export const useDeleteUserMutation = () =>
  useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
```

**When to add something here:** New API endpoint the UI needs → add a hook. Business logic that spans multiple infrastructure calls → add a service method.

---

## Layer 3 — Infrastructure

**Location:** `src/infrastructure/`

**What lives here:** Everything that touches the outside world — HTTP, localStorage, sessionStorage, cookies.

**Structure:**
```
infrastructure/
├── api/           One file per resource (auth.api.ts, users.api.ts)
├── http/          httpClient wrapper + error handler
└── storage/       tokenStorage, sessionStorage adapters
```

**Rules:**
- Every API adapter has an `if (appConfig.useMockApi)` branch — real and mock in the same file
- The mock branch simulates network delay with `await delay(ms)` so the UI can be tested realistically
- Never expose raw Axios response objects — return shaped DTOs

**API adapter pattern:**

```ts
// src/infrastructure/api/users.api.ts
export const usersApi = {
  async list(page = 1, pageSize = 20): Promise<PagedResponseDto<UserSummaryDto>> {
    if (appConfig.useMockApi) {
      await delay(600)
      // ... return mock data
    }
    const { data } = await httpClient.get<PagedResponseDto<UserSummaryDto>>('/users', {
      params: { page, pageSize },
    })
    return data
  },
}
```

**When to add something here:** New backend endpoint, new browser storage key, new HTTP interceptor.

---

## Layer 4 — Presentation

**Location:** `src/presentation/`

**What lives here:** React components, pages, layouts, and routes.

**Structure:**
```
presentation/
├── components/
│   ├── ui/        Reusable design-system components (Button, Card, Input...)
│   ├── layout/    AppLayout, AuthLayout
│   └── auth/      Auth-specific components (LoginForm)
├── pages/         One directory per route/feature
└── routes/        ProtectedRoute, PublicOnlyRoute guards
```

**Rules:**
- Pages call React Query hooks from `application/` — never call `infrastructure/` directly
- UI components are generic and reusable — they accept data via props, know nothing about the API
- All state for server data lives in React Query — no `useEffect` + `useState` for fetching
- Styles are Tailwind only — no CSS modules, no inline `style` props

**UI component conventions:**

```tsx
// src/presentation/components/ui/Button.tsx
const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500',
  ghost:   'bg-transparent text-slate-300 hover:bg-white/5',
} satisfies Record<string, string>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
```

Key points:
- `React.forwardRef` on every component
- Named exports (no default exports)
- `cn()` for class merging — never string concatenation
- Variant/size maps typed with `Record<Variant, string>`

---

## Shared

**Location:** `src/shared/`

Utilities, constants, and hooks that are genuinely cross-cutting and contain no domain logic.

```
shared/
├── constants/     routes.ts, queryKeys.ts
├── hooks/         useAuth.ts, useErrorHandler.ts
└── utils/         cn.ts, format.ts
```

`shared/` must not import from any domain/application/infrastructure/presentation layer. If you find yourself putting business logic here, it belongs in `domain` or `application` instead.

---

## Adding a New Feature — End to End

Example: adding a **Notifications** feature.

### Step 1 — Domain model

```ts
// src/domain/models/Notification.ts
export type NotificationKind = 'info' | 'warning' | 'error'

export interface Notification {
  readonly id: string
  readonly kind: NotificationKind
  readonly message: string
  readonly readAt: string | null
  readonly createdAt: string
}

export const isUnread = (n: Notification): boolean => n.readAt === null
```

### Step 2 — Infrastructure adapter

```ts
// src/infrastructure/api/notifications.api.ts
export const notificationsApi = {
  async list(): Promise<Notification[]> {
    if (appConfig.useMockApi) {
      await delay(400)
      return mockNotifications
    }
    const { data } = await httpClient.get<Notification[]>('/notifications')
    return data
  },

  async markRead(id: string): Promise<void> {
    if (appConfig.useMockApi) {
      await delay(200)
      return
    }
    await httpClient.patch(`/notifications/${id}/read`)
  },
}
```

### Step 3 — Application hook

```ts
// src/application/notifications/useNotificationQueries.ts
export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationsApi.list,
  })

export const useMarkReadMutation = () =>
  useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
```

### Step 4 — Presentation

```tsx
// src/presentation/pages/notifications/NotificationsPage.tsx
export const NotificationsPage: React.FC = () => {
  const { data = [], isLoading } = useNotificationsQuery()
  const markRead = useMarkReadMutation()

  return (
    <div>
      {data.map((n) => (
        <NotificationRow
          key={n.id}
          notification={n}
          onMarkRead={() => markRead.mutate(n.id)}
        />
      ))}
    </div>
  )
}
```

### Step 5 — Wire up the route

```ts
// src/app/router.tsx
{ path: '/notifications', element: <NotificationsPage /> }
```

---

## Performance Rules

Heavy CSS effects create GPU compositing layers that can make the entire browser sluggish — not just the page. These rules are enforced automatically by `npm run pre-commit`.

| Rule | Why |
|---|---|
| No `backdrop-blur-xl/2xl` outside full-screen overlays | 24px blur = full GPU pass per element |
| No `backdrop-blur` on `sticky` or `fixed` elements | Repaints on every scroll frame |
| No `backdrop-blur` inside `.map()` | Creates N blur layers simultaneously |
| Add `will-change-transform` to large animated elements | Allows browser to pre-promote compositor layer |

**Quick browser audit** — paste in DevTools console:
```js
document.querySelectorAll('*').forEach(el => {
  const bf = getComputedStyle(el).backdropFilter;
  if (bf && bf !== 'none') console.log(el, bf);
});
```

If the output has more than 1–2 entries, investigate.

---

## Mock API

The mock API lives entirely within each infrastructure adapter. No separate mock server.

```
VITE_USE_MOCK_API=true   →  uses in-file mock data + delay()
VITE_USE_MOCK_API=false  →  hits real backend at VITE_API_BASE_URL
```

Each adapter has this exact branching pattern, which means swapping from mock to real is a single env variable change — the application and presentation layers never know the difference.
