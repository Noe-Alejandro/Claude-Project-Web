import { readFileSync } from 'fs'

import { checkNoDangerousHtml } from '../rules/security/no-dangerous-html.mjs'
import { checkNoHardcodedSecrets } from '../rules/security/no-hardcoded-secrets.mjs'

export async function runSecurity(context) {
  const issues = []

  for (const file of context.files) {
    const relativeFile = context.toRelative(file)
    const lines = readFileSync(file, 'utf8').split('\n')

    issues.push(...checkNoDangerousHtml(lines, relativeFile))
    issues.push(...checkNoHardcodedSecrets(lines, relativeFile))
  }

  return {
    name: 'security',
    ok: !issues.some((issue) => issue.severity === 'critical'),
    issues,
  }
}
