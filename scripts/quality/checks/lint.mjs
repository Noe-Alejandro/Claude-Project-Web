import { runCommand } from '../utils/shell.mjs'

export async function runLint(context) {
  const result = runCommand('npm run lint', { cwd: context.root })

  return {
    name: 'lint',
    ok: result.ok,
    issues: result.ok
      ? []
      : [
          {
            severity: 'critical',
            file: '.eslintrc.cjs',
            line: null,
            message: 'ESLint reported errors or warnings.',
            check: 'LINT_CHECK',
          },
        ],
    output: result.output,
  }
}
