import { SECURITY_PATTERNS } from '../../config/patterns.mjs'

export function checkNoDangerousHtml(lines, file) {
  const issues = []

  lines.forEach((line, index) => {
    if (!SECURITY_PATTERNS.dangerousHtml.test(line)) {
      return
    }

    issues.push({
      severity: 'critical',
      file,
      line: index + 1,
      message: 'Avoid dangerouslySetInnerHTML unless the HTML is strictly sanitized.',
      check: 'SECURITY_NO_DANGEROUS_HTML',
    })
  })

  return issues
}
