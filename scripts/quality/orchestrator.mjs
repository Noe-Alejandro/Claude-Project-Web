import { runArchitecture } from './checks/architecture.mjs'
import { runFormat } from './checks/format.mjs'
import { runLint } from './checks/lint.mjs'
import { runPerformance } from './checks/performance.mjs'
import { runSecurity } from './checks/security.mjs'
import { runTypes } from './checks/types.mjs'
import { QUALITY_THRESHOLDS } from './config/thresholds.mjs'
import { createContext } from './context.mjs'
import { printCheckResult, printSummary } from './utils/logger.mjs'
import { calculateScore } from './utils/scoring.mjs'

/**
 * Check registry.
 *
 * Principle: each check here does exactly one of two things —
 *   1. Orchestrates an existing tool (Prettier, ESLint, tsc). The tool owns the logic.
 *   2. Catches something no existing tool can (Tailwind GPU patterns, layer imports, secrets).
 *
 * Never duplicate what ESLint, TypeScript, or Prettier already enforce.
 */
const CHECKS = [
  // Tool orchestration — delegate fully, don't reimplement
  runFormat,       // → npm run format:check  (Prettier)
  runLint,         // → npm run lint          (ESLint — covers React, a11y, keys, hooks)
  runTypes,        // → npm run type-check    (TypeScript)

  // Custom — genuinely outside what tools can express
  runPerformance,  // Tailwind GPU anti-patterns (backdrop-blur, will-change)
  runArchitecture, // Layer dependency rule (domain ← application ← infrastructure ← presentation)
  runSecurity,     // Hardcoded secrets in production source (excludes test/mock files)
]

export async function runQualityChecks() {
  const context = createContext()
  const results = []

  for (const check of CHECKS) {
    results.push(await check(context))
  }

  const issues = results.flatMap((result) => result.issues ?? [])
  const score = calculateScore(issues)
  const ok = results.every((result) => result.ok) && score >= QUALITY_THRESHOLDS.passingScore

  results.forEach((result, index) => {
    printCheckResult(result, index + 1, CHECKS.length)
  })

  printSummary({ score, ok, issues })

  return { ok, score, issues, results, context }
}
