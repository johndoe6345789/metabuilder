export const extractFunctionBody = (content: string, startIndex: number): string => {
  let braceCount = 0
  let inFunction = false
  let result = ''

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i]

    if (char === '{') {
      inFunction = true
      braceCount++
    }

    if (inFunction) {
      result += char

      if (char === '}') {
        braceCount--
        if (braceCount === 0) break
      }
    }
  }

  return result
}
