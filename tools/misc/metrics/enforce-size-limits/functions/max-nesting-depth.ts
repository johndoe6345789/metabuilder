export function maxNestingDepth(content: string): number {
  let maxDepth = 0
  let currentDepth = 0

  for (const char of content) {
    if (char === '{' || char === '[' || char === '(') {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (char === '}' || char === ']' || char === ')') {
      currentDepth--
    }
  }

  return maxDepth
}
