# New Feature Scaffold

Scaffold a complete feature across all four clean architecture layers. The argument is the feature name in kebab-case (e.g. `user-profile`, `notifications`).

## Before writing anything

1. Read `src/domain/models/User.ts` — understand the domain model conventions (pure TS interfaces, readonly fields, pure helper functions, no imports from React or libraries)
2. Read `src/application/auth/AuthService.ts` — understand application service conventions (plain object with async methods, orchestrates domain + infrastructure, no React)
3. Read `src/infrastructure/api/auth.api.ts` — understand infrastructure API conventions (DTOs, mock path + real path, `httpClient`, `AppError`)
4. Read `src/application/auth/useAuthQueries.ts` — understand React Query hook conventions
5. Read one presentation page (e.g. `src/presentation/pages/dashboard/DashboardPage.tsx`) — understand page/component conventions

Then scaffold the following files for feature `$ARGUMENTS`:

## Files to create

### 1. Domain layer — `src/domain/models/{PascalName}.ts`
- Pure TypeScript interfaces — no React, no library imports
- All fields `readonly`
- Include Zod schema for validation if the feature involves forms (import zod as `z`)
- Include pure helper functions (value objects) if meaningful

### 2. Application layer — `src/application/{kebab-name}/{PascalName}Service.ts`
- Plain object export (`export const {name}Service = { ... }`)
- Each method is async, typed, and throws `AppError` on failure
- No React imports
- Imports only from `@domain/...` and `@infrastructure/...`

### 3. Application layer — `src/application/{kebab-name}/use{PascalName}Queries.ts`
- React Query hooks using `useQuery` / `useMutation` from `@tanstack/react-query`
- Query keys from `src/shared/constants/queryKeys.ts` (add new keys there)
- One hook per use-case (fetch list, fetch single, create, update, delete as applicable)

### 4. Infrastructure layer — `src/infrastructure/api/{kebab-name}.api.ts`
- DTOs matching expected backend contracts
- `if (appConfig.useMockApi)` branch with realistic mock data and `delay()`
- Real implementation uses `httpClient`

### 5. Presentation layer — `src/presentation/pages/{kebab-name}/{PascalName}Page.tsx`
- Uses the React Query hooks from step 3
- Loading state handled with `<Spinner />`
- Error state handled with `<Alert variant="error" />`
- Uses existing UI components from `src/presentation/components/ui/`
- No direct API calls — all data through React Query hooks

### 6. Route registration — update `src/app/router.tsx` and `src/shared/constants/routes.ts`
- Add route constant in `routes.ts`
- Lazy-import the page in `router.tsx` and add the route inside the appropriate layout

## After scaffolding
Run `npm run type-check` and `npm run lint` — fix all errors before finishing.
Report a summary of files created and the route path added.
