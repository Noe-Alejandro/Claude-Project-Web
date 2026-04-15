#!/usr/bin/env node
/**
 * Pre-commit preflight check.
 * Runs: Prettier → ESLint → TypeScript → GPU/CSS performance audit.
 *
 * Usage:
 *   npm run pre-commit
 *   node scripts/pre-commit-check.mjs
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

// ─── Colours ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

const pass = `${c.green}✓ PASS${c.reset}`
const fail = `${c.red}✗ FAIL${c.reset}`

function divider() {
  console.log(`${c.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
}

function step(n, total, label) {
  process.stdout.write(`  ${c.dim}[${n}/${total}]${c.reset} ${label.padEnd(35)}`)
}

// ─── Shell runner ─────────────────────────────────────────────────────────────
function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return { ok: true, output: out }
  } catch (e) {
    return { ok: false, output: (e.stdout ?? '') + (e.stderr ?? '') }
  }
}

// ─── File walker ──────────────────────────────────────────────────────────────
function walk(dir, exts) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walk(full, exts))
    } else if (exts.some((e) => full.endsWith(e))) {
      results.push(full)
    }
  }
  return results
}

// ─── GPU / CSS audit ──────────────────────────────────────────────────────────
const OVERLAY_NAME = /modal|overlay|dialog|drawer|sheet|backdrop/i
// A full-screen fixed overlay (e.g. modal backdrop) — blur is acceptable here
const FULLSCREEN_OVERLAY = /fixed\s[^"]*inset-0/

/**
 * Returns true if the blur line sits inside a .map() callback.
 * Strategy: walk backwards up to 10 lines looking for a .map( opener
 * whose indentation is strictly less than the blur line (meaning the blur
 * element is a child of that map callback).
 */
function isInsideMap(lines, lineIndex) {
  const blurIndent = lines[lineIndex].search(/\S/) // first non-space char index
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 10); i--) {
    const line = lines[i]
    if (!line.trim()) continue
    const indent = line.search(/\S/)
    // A .map( at lower indentation than our blur line = enclosing map
    if (line.includes('.map(') && indent < blurIndent) return true
    // Hit a closing tag or line at equal/lesser indent that isn't a map = out of scope
    if (indent <= blurIndent && !line.includes('.map(')) break
  }
  return false
}

function auditPerformance() {
  const files = walk(SRC, ['.tsx', '.ts', '.css'])
  const issues = [] // { severity: 'critical'|'warn', check, file, line, message }

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, '/')
    const content = readFileSync(file, 'utf8')
    const lines = content.split('\n')
    const isOverlay = OVERLAY_NAME.test(rel)

    // Count blurs in this file
    const blurLines = [] // { index, text }
    const mapLines = [] // line indexes with .map(

    lines.forEach((text, i) => {
      if (/backdrop-blur/.test(text)) blurLines.push({ index: i, text })
      if (/\.map\(/.test(text)) mapLines.push(i)
    })

    if (blurLines.length === 0) continue

    // Check A — backdrop-blur-xl / 2xl outside overlays
    if (!isOverlay) {
      for (const { index, text } of blurLines) {
        if (/backdrop-blur-xl|backdrop-blur-2xl/.test(text)) {
          issues.push({
            severity: 'critical',
            check: 'A',
            file: rel,
            line: index + 1,
            message: 'backdrop-blur-xl/2xl on a non-overlay element — very expensive GPU pass',
          })
        }
      }
    }

    // Check B — backdrop-blur on sticky or fixed elements (same or adjacent line)
    // Exclude full-screen overlays (fixed inset-0) — those are intentional modal backdrops
    // Exclude backdrop-blur-sm (4px) on fixed — too small to matter
    for (const { index, text } of blurLines) {
      if (/backdrop-blur-sm/.test(text)) continue // 4px blur is negligible
      const ctx = lines.slice(Math.max(0, index - 2), index + 3).join(' ')
      if (FULLSCREEN_OVERLAY.test(ctx)) continue // modal/overlay backdrop — acceptable
      if (/\bsticky\b|\bfixed\b/.test(ctx)) {
        issues.push({
          severity: 'critical',
          check: 'B',
          file: rel,
          line: index + 1,
          message: 'backdrop-blur on a sticky/fixed element — repaints every scroll frame',
        })
      }
    }

    // Check C — 3+ blur usages per file (non-overlay)
    if (!isOverlay && blurLines.length >= 3) {
      issues.push({
        severity: 'warn',
        check: 'C',
        file: rel,
        line: null,
        message: `${blurLines.length} backdrop-blur usages in one file — likely applied to repeated elements`,
      })
    }

    // Check D — transition-transform without will-change
    // Skip icon-sized elements (h-4/h-5/h-6 w-4/w-5/w-6) — will-change adds
    // GPU overhead that outweighs the benefit on tiny elements like chevrons/icons.
    // Also skip if the element is clearly small (contains only icon utility classes).
    for (let i = 0; i < lines.length; i++) {
      if (/transition-transform/.test(lines[i])) {
        const ctx = lines.slice(Math.max(0, i - 3), i + 4).join(' ')
        if (/will-change/.test(ctx)) continue // already handled
        if (/\bh-[456]\b.*\bw-[456]\b|\bw-[456]\b.*\bh-[456]\b/.test(ctx)) continue // icon size
        issues.push({
          severity: 'warn',
          check: 'D',
          file: rel,
          line: i + 1,
          message: 'transition-transform without will-change — browser promotes layer mid-animation causing stutter',
        })
      }
    }

    // Check E — backdrop-blur inside .map() blocks
    for (const { index } of blurLines) {
      if (isInsideMap(lines, index)) {
        issues.push({
          severity: 'critical',
          check: 'E',
          file: rel,
          line: index + 1,
          message: 'backdrop-blur inside .map() — creates N simultaneous GPU layers',
        })
      }
    }
  }

  return issues
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log()
divider()
console.log(`  ${c.bold}PRE-COMMIT PREFLIGHT${c.reset}`)
divider()
console.log()

const results = []

// [1] Prettier
step(1, 4, 'Formatting (Prettier)')
const fmt = run('npm run format:check')
results.push(fmt.ok)
console.log(fmt.ok ? pass : fail)
if (!fmt.ok) console.log(fmt.output.trim().split('\n').map((l) => `     ${l}`).join('\n'))

// [2] ESLint
step(2, 4, 'Lint (ESLint)')
const lint = run('npm run lint')
results.push(lint.ok)
console.log(lint.ok ? pass : fail)
if (!lint.ok) console.log(lint.output.trim().split('\n').map((l) => `     ${l}`).join('\n'))

// [3] TypeScript
step(3, 4, 'Types (tsc --noEmit)')
const types = run('npm run type-check')
results.push(types.ok)
console.log(types.ok ? pass : fail)
if (!types.ok) console.log(types.output.trim().split('\n').map((l) => `     ${l}`).join('\n'))

// [4] GPU/CSS audit
step(4, 4, 'GPU/CSS Performance audit')
const perfIssues = auditPerformance()
const criticals = perfIssues.filter((i) => i.severity === 'critical')
const warnings = perfIssues.filter((i) => i.severity === 'warn')
const perfOk = criticals.length === 0 && warnings.length < 3
results.push(perfOk)

if (perfIssues.length === 0) {
  console.log(pass)
} else {
  const label = perfOk ? `${c.yellow}⚠ WARN${c.reset}` : fail
  const counts = []
  if (criticals.length) counts.push(`${criticals.length} critical`)
  if (warnings.length) counts.push(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}`)
  console.log(`${label}  — ${counts.join(', ')}`)
  for (const issue of perfIssues) {
    const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file
    const icon = issue.severity === 'critical' ? c.red + '✗' : c.yellow + '⚠'
    console.log(`     ${icon} [${issue.check}]${c.reset} ${c.dim}${loc}${c.reset}`)
    console.log(`         ${issue.message}`)
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log()
divider()
const allPassed = results.every(Boolean)
if (allPassed) {
  console.log(`  ${c.green}${c.bold}RESULT: ✓ READY TO COMMIT${c.reset}`)
} else {
  console.log(`  ${c.red}${c.bold}RESULT: ✗ FIX THESE ISSUES FIRST${c.reset}`)
}
divider()
console.log()

process.exit(allPassed ? 0 : 1)
