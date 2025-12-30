export const calculateComplexity = (code: string): number => {
  let complexity = 1
  complexity += (code.match(/if\s*\(/g) || []).length
  complexity += (code.match(/\?.*:/g) || []).length
  complexity += (code.match(/case\s+/g) || []).length
  complexity += (code.match(/catch\s*\(/g) || []).length
  complexity += (code.match(/for\s*\(/g) || []).length
  complexity += (code.match(/while\s*\(/g) || []).length
  complexity += (code.match(/&&/g) || []).length * 0.1
  complexity += (code.match(/\|\|/g) || []).length * 0.1
  return Math.round(complexity * 10) / 10
}
