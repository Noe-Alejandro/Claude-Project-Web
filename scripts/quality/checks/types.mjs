import { runCommand } from '../utils/shell.mjs'

export async function runTypes(context) {
  const result = runCommand('npm run type-check', { cwd: context.root })

  return {
    name: 'types',
    ok: result.ok,
    issues: result.ok
      ? []
      : [
          {
            severity: 'critical',
            file: 'tsconfig.json',
            line: null,
            message: 'TypeScript type-check failed.',
            check: 'TYPE_CHECK',
          },
        ],
    output: result.output,
  }
}
