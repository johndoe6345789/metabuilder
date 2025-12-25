#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

interface ComplexityMetrics {
  file: string
  functions: Array<{
    name: string
    complexity: number
    lines: number
  }>
  averageComplexity: number
  maxComplexity: number
  violations: string[]
}

const MAX_CYCLOMATIC_COMPLEXITY = 10
const MAX_COGNITIVE_COMPLEXITY = 15
const MAX_NESTING = 4

function analyzeComplexity(): ComplexityMetrics[] {
  const results: ComplexityMetrics[] = []
  const srcDir = 'src'
  
  function walkDir(dir: string) {
    const files = readdirSync(dir)
    
    for (const file of files) {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
        walkDir(fullPath)
      } else if (['.ts', '.tsx'].includes(extname(file))) {
        analyzeFile(fullPath, results)
      }
    }
  }
  
  walkDir(srcDir)
  return results
}

function analyzeFile(filePath: string, results: ComplexityMetrics[]) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    const metrics: ComplexityMetrics = {
      file: filePath,
      functions: [],
      averageComplexity: 0,
      maxComplexity: 0,
      violations: []
    }
    
    // Simple regex-based analysis (production would use AST parser)
    const functionPattern = /(?:function|const|async\s+(?:function)?|export\s+(?:async\s+)?function)\s+(\w+)/g
    let match
    
    while ((match = functionPattern.exec(content)) !== null) {
      const startIndex = match.index
      const functionName = match[1]
      
      // Calculate complexity by counting conditionals
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
        metrics.functions.reduce((sum, f) => sum + f.complexity, 0) / metrics.functions.length
    }
    
    if (metrics.violations.length > 0) {
      results.push(metrics)
    }
  } catch (e) {
    // Skip files that can't be analyzed
  }
}

function extractFunctionBody(content: string, startIndex: number): string {
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

function calculateComplexity(code: string): number {
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

function calculateNestingLevel(code: string): number {
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

// Main execution
const results = analyzeComplexity()

const summary = {
  totalFilesAnalyzed: results.length,
  violatingFiles: results.length,
  totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
  avgMaxComplexity: results.length > 0
    ? results.reduce((sum, r) => sum + r.maxComplexity, 0) / results.length
    : 0,
  details: results,
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))
