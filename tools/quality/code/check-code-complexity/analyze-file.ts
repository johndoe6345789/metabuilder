import { readFileSync } from 'fs'

import { MAX_CYCLOMATIC_COMPLEXITY, MAX_NESTING } from './constants'
import { calculateComplexity } from './calculate-complexity'
import { calculateNestingLevel } from './calculate-nesting-level'
import { extractFunctionBody } from './extract-function-body'
import { FUNCTION_PATTERN } from './function-pattern'
import { ComplexityMetrics } from './types'

export const analyzeFile = (filePath: string): ComplexityMetrics | null => {
  try {
    const content = readFileSync(filePath, 'utf8')

    const metrics: ComplexityMetrics = {
      file: filePath,
      functions: [],
      averageComplexity: 0,
      maxComplexity: 0,
      violations: []
    }

    let match

    while ((match = FUNCTION_PATTERN.exec(content)) !== null) {
      const startIndex = match.index
      const functionName = match[1]

      const functionContent = extractFunctionBody(content, startIndex)
      const complexity = calculateComplexity(functionContent)
      const nestingLevel = calculateNestingLevel(functionContent)

      metrics.functions.push({
        name: functionName,
        complexity,
        lines: functionContent.split('\n').length
      })

      metrics.maxComplexity = Math.max(metrics.maxComplexity, complexity)

      if (complexity > MAX_CYCLOMATIC_COMPLEXITY) {
        metrics.violations.push(
          `Function "${functionName}" has complexity ${complexity} (max: ${MAX_CYCLOMATIC_COMPLEXITY})`
        )
      }

      if (nestingLevel > MAX_NESTING) {
        metrics.violations.push(
          `Function "${functionName}" has nesting level ${nestingLevel} (max: ${MAX_NESTING})`
        )
      }
    }

    if (metrics.functions.length > 0) {
      metrics.averageComplexity =
        metrics.functions.reduce((sum, func) => sum + func.complexity, 0) / metrics.functions.length
    }

    if (metrics.violations.length === 0) {
      return null
    }

    return metrics
  } catch {
    return null
  }
}
