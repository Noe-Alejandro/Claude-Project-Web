import { existsSync } from 'fs'
import { join, relative } from 'path'

import { FILE_PATTERNS } from './config/patterns.mjs'
import { getStagedFiles } from './utils/git.mjs'
import { walkFiles } from './utils/fileWalker.mjs'

function getAllSourceFiles(root) {
  const sourceDir = join(root, 'src')

  if (!existsSync(sourceDir)) {
    return []
  }

  return walkFiles(sourceDir, FILE_PATTERNS.sourceExtensions)
}

export function createContext() {
  const root = process.cwd()
  const stagedFiles = getStagedFiles(root)
  const files = stagedFiles.length > 0 ? stagedFiles : getAllSourceFiles(root)

  return Object.freeze({
    root,
    files,
    stagedFiles,
    isFullScan: stagedFiles.length === 0,
    toRelative(file) {
      return relative(root, file).replace(/\\/g, '/')
    },
  })
}
