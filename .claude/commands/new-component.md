# New UI Component

Create a new reusable UI component for this project. The argument is the component name (PascalCase).

## Instructions

Read the existing component most similar to what's being requested (e.g. `src/presentation/components/ui/Button.tsx`) to confirm current conventions before writing anything.

Then create the component at `src/presentation/components/ui/$ARGUMENTS.tsx` following these rules:

### Component rules
- Use `React.forwardRef` so the component is ref-forwardable
- Define a `{Name}Props` interface extending the relevant HTML element's attributes (e.g. `React.HTMLAttributes<HTMLDivElement>`)
- Use `cn()` from `@shared/utils/cn` for all className composition — never raw string concatenation
- Accept a `className` prop and spread it last inside `cn()`
- Export as a **named export** and set `ComponentName.displayName = 'ComponentName'`
- If the component has visual variants or sizes, define them as `Record<Variant, string>` maps (same pattern as Button.tsx) — no inline ternaries for styles
- Use Tailwind exclusively — no inline `style` props, no CSS modules
- Follow the dark-first design already established (slate-950 backgrounds, white/slate text, brand-* accent colors)
- Do NOT add JSDoc comments unless the prop is genuinely non-obvious

### Accessibility rules
- Semantic HTML first: use the right element before reaching for `role=`
- Interactive elements must be keyboard-reachable and have visible focus rings (`focus-visible:ring-2`)
- Use `aria-label` / `aria-labelledby` when there is no visible text label
- Color alone must never convey meaning — pair color with an icon or text

### Test file
Also create `src/presentation/components/ui/__tests__/$ARGUMENTS.test.tsx` with:
- At minimum: renders without crashing, renders each variant, forwards a ref
- Use `@testing-library/react` and `vitest`
- Follow the pattern in `src/presentation/components/ui/__tests__/Button.test.tsx`

After writing both files, run `npm run type-check` and fix any TypeScript errors before finishing.
