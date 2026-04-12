# Review UI Component or Page

Review a component or page for design quality, accessibility, TypeScript correctness, and adherence to this project's clean architecture. The argument is the file path relative to `src/`.

## Instructions

Read the file at `src/$ARGUMENTS` in full. Then evaluate it across these five dimensions:

### 1. Design & visual consistency
- Does it use the established dark-first palette (slate-950 bg, slate-* text, brand-* accents)?
- Are spacing, sizing, and border-radius consistent with other components?
- Are interactive states covered: hover, active, focus, disabled, loading?
- Does it look good at both mobile (375px) and desktop (1280px+)?
- Are there magic numbers or one-off color values that should use a Tailwind token?

### 2. Accessibility (WCAG 2.1 AA minimum)
- Are all interactive elements keyboard-reachable with visible focus rings (`focus-visible:ring-2`)?
- Is there sufficient color contrast (4.5:1 for text, 3:1 for UI elements)?
- Are images, icons used alone, and form inputs properly labelled?
- Are landmark regions, headings, and list semantics correct?
- Does any dynamic content update announce itself to screen readers (`aria-live`, `role="status"`)?

### 3. TypeScript & correctness
- Are all props typed? No `any`, no non-null assertions unless justified?
- Does the component accept and forward `className` and `ref` if it renders a DOM element?
- Are event handlers typed with the correct React synthetic event type?
- Is the component's export named (not default)?

### 4. Clean architecture compliance
- Does the component import only from `@presentation/...`, `@shared/...`, or npm packages?
- Is there any business logic (API calls, data transformation, auth checks) that should live in a service or hook instead?
- Are React Query hooks used for server state rather than `useEffect` + `useState`?

### 5. Performance
- Are large lists virtualized or paginated?
- Are expensive computations wrapped in `useMemo` / `useCallback` where the dependency array is stable?
- Are images lazy-loaded?
- Are there unnecessary re-renders caused by object/array literals in JSX props?

## Output format

For each dimension, list:
- **Issues** (with file:line references) — things that must be fixed
- **Suggestions** (optional improvements)
- A one-line **verdict**: Approved / Needs changes / Major rework

End with a prioritized fix list if there are issues.
