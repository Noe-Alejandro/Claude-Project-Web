import { runCommand } from '../utils/shell.mjs'

export async function runFormat(context) {
  const result = runCommand('npm run format:check', { cwd: context.root })

  return {
    name: 'format',
    ok: result.ok,
    issues: result.ok
      ? []
      : [
          {
            severity: 'critical',
            file: 'package.json',
            line: null,
            message: 'Formatting check failed.',
            check: 'FORMAT_CHECK',
          },
        ],
    output: result.output,
  }
}
