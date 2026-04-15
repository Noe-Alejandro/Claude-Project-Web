import { QUALITY_THRESHOLDS } from '../config/thresholds.mjs'

export function calculateScore(issues) {
  let score = 100

  for (const issue of issues) {
    if (issue.severity === 'critical') {
      score -= QUALITY_THRESHOLDS.criticalPenalty
      continue
    }

    if (issue.severity === 'warn') {
      score -= QUALITY_THRESHOLDS.warningPenalty
    }
  }

  return Math.max(score, 0)
}
