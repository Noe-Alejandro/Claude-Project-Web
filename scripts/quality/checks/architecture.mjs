import { readFileSync } from 'fs'

/**
 * Architecture layer check.
 *
 * Enforces the dependency rule:
 *   domain ← application ← infrastructure ← presentation
 *
 * Each layer may only import from layers to its left.
 * shared/ is available to all layers.
 *
 * This is genuinely custom to this project's structure and cannot
 * be expressed cleanly in ESLint without a bespoke plugin.
 */

const LAYER_RULES = [
  {
    // domain must not import from any other app layer
    layer: 'src/domain',
    forbidden: ['@application/', '@infrastructure/', '@presentation/'],
    label: 'domain',
  },
  {
    // application must not import from presentation
    layer: 'src/application',
    forbidden: ['@presentation/'],
    label: 'application',
  },
  {
    // presentation must not import infrastructure directly — go through application hooks
    layer: 'src/presentation',
    forbidden: ['@infrastructure/'],
    label: 'presentation',
  },
]

// Only match runtime imports — type-only imports are erased by the compiler and
// carry no runtime coupling, so they don't violate the dependency rule.
const IMPORT_RE = /^(?!.*\bimport\s+type\b).*from\s+['"](@[^'"]+)['"]/gm

export async function runArchitecture(context) {
  const issues = []

  for (const file of context.files) {
    const relativeFile = context.toRelative(file)
    const content = readFileSync(file, 'utf8')

    for (const rule of LAYER_RULES) {
      if (!relativeFile.startsWith(rule.layer)) continue

      let match
      IMPORT_RE.lastIndex = 0

      while ((match = IMPORT_RE.exec(content)) !== null) {
        const importPath = match[1]

        for (const forbidden of rule.forbidden) {
          if (importPath.startsWith(forbidden)) {
            const line = content.slice(0, match.index).split('\n').length
            issues.push({
              severity: 'critical',
              file: relativeFile,
              line,
              message: `Layer violation: ${rule.label} imports from ${importPath} — only layers to the left are allowed.`,
              check: 'ARCH_LAYER_VIOLATION',
            })
          }
        }
      }
    }
  }

  return {
    name: 'architecture',
    ok: issues.length === 0,
    issues,
  }
}
