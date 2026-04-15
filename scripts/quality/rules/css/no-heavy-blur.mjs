import { PERFORMANCE_PATTERNS } from '../../config/patterns.mjs'

export function checkNoHeavyBlur({ lines, file, isOverlay }) {
  const issues = []

  if (isOverlay) {
    return issues
  }

  lines.forEach((line, index) => {
    if (!PERFORMANCE_PATTERNS.expensiveBlur.test(line)) {
      return
    }

    issues.push({
      severity: 'critical',
      file,
      line: index + 1,
      message: 'backdrop-blur-xl/2xl on a non-overlay element is an expensive GPU pass.',
      check: 'PERF_NO_HEAVY_BLUR',
    })
  })

  return issues
}
