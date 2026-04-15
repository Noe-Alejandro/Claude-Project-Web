export function isInsideMap(lines, lineIndex) {
  const blurIndent = lines[lineIndex].search(/\S/)

  for (let index = lineIndex - 1; index >= Math.max(0, lineIndex - 10); index -= 1) {
    const line = lines[index]

    if (!line.trim()) {
      continue
    }

    const indent = line.search(/\S/)

    if (line.includes('.map(') && indent < blurIndent) {
      return true
    }

    if (indent <= blurIndent && !line.includes('.map(')) {
      break
    }
  }

  return false
}

export function checkNoBlurInMap({ blurLines, lines, file }) {
  const issues = []

  for (const blurLine of blurLines) {
    if (!isInsideMap(lines, blurLine.index)) {
      continue
    }

    issues.push({
      severity: 'critical',
      file,
      line: blurLine.index + 1,
      message: 'backdrop-blur inside .map() creates multiple simultaneous GPU layers.',
      check: 'PERF_NO_BLUR_IN_MAP',
    })
  }

  return issues
}
