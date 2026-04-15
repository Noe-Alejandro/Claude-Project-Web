const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

function divider() {
  console.log(`${colors.dim}${'━'.repeat(58)}${colors.reset}`)
}

function statusLabel(result) {
  if (result.issues?.length > 0 && result.ok) {
    return `${colors.yellow}WARN${colors.reset}`
  }

  return result.ok ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`
}

export function printHeader() {
  console.log()
  divider()
  console.log(`  ${colors.bold}${colors.cyan}QUALITY PREFLIGHT${colors.reset}`)
  divider()
  console.log()
}

export function printCheckResult(result, index, total) {
  console.log(
    `  ${colors.dim}[${index}/${total}]${colors.reset} ${result.name.padEnd(35)} ${statusLabel(result)}`,
  )

  if (result.output) {
    for (const line of result.output.split(/\r?\n/).filter(Boolean)) {
      console.log(`     ${line}`)
    }
  }

  for (const issue of result.issues ?? []) {
    const tone = issue.severity === 'critical' ? colors.red : colors.yellow
    const location = issue.line ? `${issue.file}:${issue.line}` : issue.file
    console.log(`     ${tone}[${issue.check}]${colors.reset} ${colors.dim}${location}${colors.reset}`)
    console.log(`         ${issue.message}`)
  }
}

export function printSummary({ score, ok, issues }) {
  console.log()
  divider()
  console.log(
    `  ${ok ? colors.green : colors.red}${colors.bold}${ok ? 'RESULT: READY TO COMMIT' : 'RESULT: FIX ISSUES FIRST'}${colors.reset}`,
  )
  console.log(`  Score: ${score}/100`)

  if (issues.length > 0) {
    const criticals = issues.filter((issue) => issue.severity === 'critical').length
    const warnings = issues.filter((issue) => issue.severity === 'warn').length
    console.log(`  Issues: ${criticals} critical, ${warnings} warnings`)
  }

  divider()
  console.log()
}
