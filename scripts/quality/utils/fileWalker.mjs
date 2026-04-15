import { readdirSync, statSync } from 'fs'
import { join } from 'path'

export function walkFiles(dir, extensions) {
  const results = []

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions))
      continue
    }

    if (extensions.some((extension) => fullPath.endsWith(extension))) {
      results.push(fullPath)
    }
  }

  return results
}
