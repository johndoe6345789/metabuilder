export function maxFunctionParams(content: string): number {
  const funcMatches = content.match(/(?:function|const\s+\w+\s*=|\s*\()\s*\(([^)]*)\)/g)
  if (!funcMatches) return 0

  let maxParams = 0
  for (const match of funcMatches) {
    const params = match
      .substring(match.indexOf('(') + 1, match.lastIndexOf(')'))
      .split(',')
      .filter(p => p.trim().length > 0).length
    maxParams = Math.max(maxParams, params)
  }

  return maxParams
}
