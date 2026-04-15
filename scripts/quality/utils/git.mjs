import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

import { FILE_PATTERNS } from '../config/patterns.mjs'

function isSupportedFile(file) {
  return FILE_PATTERNS.sourceExtensions.some((extension) => file.endsWith(extension))
}

export function getStagedFiles(root) {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => resolve(root, line))
      .filter((file) => existsSync(file) && isSupportedFile(file))
  } catch {
    return []
  }
}
