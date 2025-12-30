export const calculateNestingLevel = (code: string): number => {
  let maxNesting = 0
  let currentNesting = 0

  for (const char of code) {
    if (char === '{') {
      currentNesting++
      maxNesting = Math.max(maxNesting, currentNesting)
    } else if (char === '}') {
      currentNesting--
    }
  }

  return maxNesting
}
