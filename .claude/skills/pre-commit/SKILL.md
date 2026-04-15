---
name: pre-commit
description: >
  Pre-commit preflight check for this project. Run this before every commit.
  Triggers on: /pre-commit, "check before commit", "run preflight", "is the code ready to commit?".
  Runs the real script at scripts/pre-commit-check.mjs which checks formatting,
  lint, types, and CSS/GPU performance anti-patterns. Always use this skill before committing.
---

# Pre-Commit Preflight

Run the script — it does everything:

```bash
npm run pre-commit
```

That's it. The script at `scripts/pre-commit-check.mjs` handles all four checks:
1. Prettier format check
2. ESLint
3. TypeScript (noEmit)
4. GPU/CSS performance audit — detects `backdrop-blur-xl/2xl` on non-overlays,
   blurs on `sticky`/`fixed` elements, blurs inside `.map()`, and
   `transition-transform` without `will-change`.

If anything fails, show the exact output to the user and point them to the
offending file and line. Do not attempt to re-run individual steps manually —
the script already does that.
