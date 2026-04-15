export const FILE_PATTERNS = {
  sourceExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
}

export const PERFORMANCE_PATTERNS = {
  overlayName: /modal|overlay|dialog|drawer|sheet|backdrop/i,
  fullScreenOverlay: /fixed\s[^"]*inset-0/,
  blur: /backdrop-blur/,
  expensiveBlur: /backdrop-blur-xl|backdrop-blur-2xl/,
  smallBlur: /backdrop-blur-sm/,
  stickyOrFixed: /\bsticky\b|\bfixed\b/,
  transitionTransform: /transition-transform/,
  willChange: /will-change/,
  smallIcon: /\bh-[456]\b.*\bw-[456]\b|\bw-[456]\b.*\bh-[456]\b/,
}

export const SECURITY_PATTERNS = {
  dangerousHtml: /dangerouslySetInnerHTML/,
  hardcodedSecret:
    /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*['"`][^'"`\s][^'"`]*['"`]/i,
}
