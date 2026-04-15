import { execSync } from 'child_process'

export function runCommand(command, { cwd }) {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    return { ok: true, output: output.trim() }
  } catch (error) {
    return {
      ok: false,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim(),
    }
  }
}
