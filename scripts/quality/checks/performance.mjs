import { readFileSync } from 'fs'

import { PERFORMANCE_PATTERNS } from '../config/patterns.mjs'
import { checkNoBlurInMap } from '../rules/css/no-blur-in-map.mjs'
import { checkNoHeavyBlur } from '../rules/css/no-heavy-blur.mjs'

export async function runPerformance(context) {
  const issues = []

  for (const file of context.files) {
    const relativeFile = context.toRelative(file)
    const lines = readFileSync(file, 'utf8').split('\n')
    const isOverlay = PERFORMANCE_PATTERNS.overlayName.test(relativeFile)
    const blurLines = []

    lines.forEach((line, index) => {
      if (PERFORMANCE_PATTERNS.blur.test(line)) {
        blurLines.push({ index, text: line })
      }
    })

    if (blurLines.length === 0) {
      continue
    }

    issues.push(...checkNoHeavyBlur({ lines, file: relativeFile, isOverlay }))

    for (const blurLine of blurLines) {
      if (PERFORMANCE_PATTERNS.smallBlur.test(blurLine.text)) {
        continue
      }

      const window = lines.slice(Math.max(0, blurLine.index - 2), blurLine.index + 3).join(' ')

      if (PERFORMANCE_PATTERNS.fullScreenOverlay.test(window)) {
        continue
      }

      if (PERFORMANCE_PATTERNS.stickyOrFixed.test(window)) {
        issues.push({
          severity: 'critical',
          file: relativeFile,
          line: blurLine.index + 1,
          message: 'backdrop-blur on a sticky or fixed element repaints every scroll frame.',
          check: 'PERF_BLUR_ON_FIXED',
        })
      }
    }

    if (!isOverlay && blurLines.length >= 3) {
      issues.push({
        severity: 'warn',
        file: relativeFile,
        line: null,
        message: `${blurLines.length} backdrop-blur usages in one file may indicate repeated expensive effects.`,
        check: 'PERF_BLUR_DENSITY',
      })
    }

    for (let index = 0; index < lines.length; index += 1) {
      if (!PERFORMANCE_PATTERNS.transitionTransform.test(lines[index])) {
        continue
      }

      const window = lines.slice(Math.max(0, index - 3), index + 4).join(' ')

      if (PERFORMANCE_PATTERNS.willChange.test(window) || PERFORMANCE_PATTERNS.smallIcon.test(window)) {
        continue
      }

      issues.push({
        severity: 'warn',
        file: relativeFile,
        line: index + 1,
        message: 'transition-transform without will-change can cause stutter on larger elements.',
        check: 'PERF_TRANSFORM_WILL_CHANGE',
      })
    }

    issues.push(...checkNoBlurInMap({ blurLines, lines, file: relativeFile }))
  }

  return {
    name: 'performance',
    ok: !issues.some((issue) => issue.severity === 'critical'),
    issues,
  }
}
