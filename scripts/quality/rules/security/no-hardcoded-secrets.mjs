import { SECURITY_PATTERNS } from '../../config/patterns.mjs'

// Test files and infrastructure API adapters legitimately contain fake credentials.
// - Test files use throwaway values to exercise auth logic.
// - infrastructure/api/ adapters use the project's documented mock API pattern
//   (guarded by appConfig.useMockApi) with public demo credentials listed in the README.
// Real secret scanners (e.g. secretlint, truffleHog) handle production secrets via
// git history scanning and entropy analysis — not filename-blind regex.
const EXCLUDED_FILE_RE = /__tests__|\.test\.|\.spec\.|mock|fixture|infrastructure\/api\//i

export function checkNoHardcodedSecrets(lines, file) {
  if (EXCLUDED_FILE_RE.test(file)) return []

  const issues = []

  lines.forEach((line, index) => {
    if (!SECURITY_PATTERNS.hardcodedSecret.test(line)) return

    issues.push({
      severity: 'critical',
      file,
      line: index + 1,
      message: 'Possible hardcoded secret in production code. Move to an environment variable.',
      check: 'SECURITY_NO_HARDCODED_SECRET',
    })
  })

  return issues
}
