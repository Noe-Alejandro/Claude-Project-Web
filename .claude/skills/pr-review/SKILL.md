---
name: pr-review
description: >
  AI-powered pull request review for this project. Triggers on: /pr-review, "review my PR",
  "review my changes", "check my diff", "is my code ready to merge?", "review before push".
  Diffs the current branch against main, runs the pre-commit preflight, then reviews the changes
  for bugs, security issues, performance problems, architecture violations, and code quality.
  Use this before opening any PR or pushing to a shared branch.
---

# PR Review

You are doing a thorough pre-merge review of the developer's current branch. Your job is to catch
real problems — not to nitpick style that tooling already handles.

## Step 1 — Run the preflight

```bash
npm run pre-commit
```

If it fails, stop and report the failures immediately. The developer must fix those before review
makes sense. Show the exact output.

## Step 2 — Get the diff

```bash
git diff main...HEAD
```

If the branch has no commits ahead of main, tell the developer and stop.

Also get a file-level summary:
```bash
git diff main...HEAD --stat
```

And the commit log:
```bash
git log main..HEAD --oneline
```

## Step 3 — Review the diff

Work through the diff file by file. For each changed file, think about:

### Bugs & correctness
- Logic errors, off-by-one, wrong conditions
- Async operations missing `await`
- State mutations that should be immutable
- Unhandled error paths (especially in try/catch that silently swallow errors)
- Race conditions in React (stale closures, missing dependencies in hooks)

### Security
- User input used directly in DOM (`dangerouslySetInnerHTML`, unescaped URLs)
- Sensitive data logged or exposed in error messages
- Auth checks missing on new routes or API calls
- Tokens or secrets hardcoded or committed

### Performance
- `backdrop-blur-xl/2xl` added to non-overlay elements
- `backdrop-blur` on `sticky` or `fixed` elements
- `backdrop-blur` inside `.map()` callbacks
- Large arrays recreated on every render without `useMemo`
- Event handlers inside `.map()` without `useCallback` (prevents memoization)
- New `useEffect` that could be replaced by React Query

### Architecture violations
- Presentation layer importing directly from infrastructure (`@infrastructure/`)
- Domain models importing from application or infrastructure
- Business logic added to a UI component instead of a service
- New `useEffect + useState` for data fetching instead of a React Query hook
- Inline API calls (`axios.get(...)`) instead of going through the `httpClient` wrapper

### Code quality
- Duplicated logic that should be a shared utility
- Magic numbers or strings that should be constants
- Missing TypeScript types (especially `any`)
- Commented-out code left in

## Step 4 — Write the review

Structure your output exactly like this:

---

## PR Review — `<branch-name>` → `main`

**Commits:** N commit(s)
**Files changed:** N files (+X −Y lines)

### Preflight
✓ All checks pass  /  ✗ Failed — [list failures]

### Summary
One short paragraph describing what this PR does, based on the diff.

### Issues

#### Critical (must fix before merge)
- **[file:line]** Description of the problem and why it matters.

#### Warnings (should fix, won't block merge)
- **[file:line]** Description.

#### Suggestions (optional improvements)
- **[file:line]** Description.

### What looks good
Point out 2–3 things that are done well. Be specific — "the error handling in authService.logout
correctly cleans up local state even when the server call fails" is useful. "Nice code" is not.

### Verdict
- **Ready to merge** — no critical issues
- **Needs fixes** — N critical issue(s) listed above
- **Needs discussion** — architectural question that should be resolved before merging

---

## Scope

Focus on what static analysis and linting cannot catch. Don't comment on:
- Formatting (Prettier handles it)
- Import ordering (ESLint handles it)
- Naming that is unconventional but not wrong

Do comment on logic, security, architecture, and performance — the things that only a reviewer
with context can catch.
