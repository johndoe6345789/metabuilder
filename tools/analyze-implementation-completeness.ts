#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join, extname } from 'path'

interface ComponentAnalysis {
  file: string
  line: number
  name: string
  type: 'component' | 'function'
  returnLines: number
  jsxLines: number
  logicalLines: number
  completeness: number
  flags: string[]
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  summary: string
}

function analyzeImplementations(): ComponentAnalysis[] {
  const results: ComponentAnalysis[] = []
  const srcDir = 'src'
  
  function walkDir(dir: string) {
    try {
      const files = readdirSync(dir)
      
      for (const file of files) {
        const fullPath = join(dir, file)
        const stat = statSync(fullPath)
        
        if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
          walkDir(fullPath)
        } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
          analyzeFile(fullPath, results)
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  walkDir(srcDir)
  return results
}

function analyzeFile(filePath: string, results: ComponentAnalysis[]): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    
    // Find all functions and components
    const defPattern = /(?:export\s+)?(?:async\s+)?(?:function|const)\s+(\w+)\s*(?::<[^=]*>)?\s*(?:=|{)/g
    let match
    
    while ((match = defPattern.exec(content)) !== null) {
      const name = match[1]
      const startIndex = match.index
      const lineNumber = content.substring(0, startIndex).split('\n').length
      
      // Find the function body
      const bodyStart = content.indexOf('{', startIndex)
      let braceCount = 0
      let bodyEnd = bodyStart
      
      for (let i = bodyStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++
        if (content[i] === '}') braceCount--
        if (braceCount === 0) {
          bodyEnd = i
          break
        }
      }
      
      if (bodyEnd > bodyStart) {
        const body = content.substring(bodyStart + 1, bodyEnd)
        const isComponent = name[0] === name[0].toUpperCase() && filePath.includes('component')
        
        const analysis = analyzeBody(body, name, isComponent ? 'component' : 'function', filePath, lineNumber)
        if (analysis.flags.length > 0 || analysis.completeness < 50) {
          results.push(analysis)
        }
      }
    }
  } catch (e) {
    // Skip
  }
}

function analyzeBody(body: string, name: string, type: 'component' | 'function', filePath: string, lineNumber: number): ComponentAnalysis {
  const lines = body.split('\n').filter(l => l.trim().length > 0)
  const returnLines = lines.filter(l => l.includes('return')).length
  const jsxLines = lines.filter(l => l.match(/<[A-Z]/)).length
  const logicalLines = lines.filter(l => 
    !l.match(/^\/\//) && 
    !l.match(/^\*/) && 
    l.trim().length > 0 &&
    !l.includes('return')
  ).length
  
  const flags: string[] = []
  let completeness = 100
  
  // Check for stub indicators
  if (body.includes('TODO') || body.includes('FIXME')) {
    flags.push('has-todo-comments')
    completeness -= 20
  }
  
  if (body.match(/throw\s+new\s+Error\s*\(\s*['"]not\s+implemented/i)) {
    flags.push('throws-not-implemented')
    completeness = 0
  }
  
  if (body.includes('console.log') && logicalLines <= 1) {
    flags.push('only-console-log')
    completeness -= 30
  }
  
  if (body.match(/return\s+(null|undefined|{}\s*;)/)) {
    flags.push('returns-empty-value')
    completeness -= 25
  }
  
  if (body.match(/\/\/\s*(mock|stub|placeholder)/i)) {
    flags.push('marked-as-mock')
    completeness -= 40
  }
  
  if (type === 'component' && jsxLines === 0) {
    flags.push('component-no-jsx')
    completeness -= 50
  }
  
  if (body.match(/<>\s*<\/>/)) {
    flags.push('empty-fragment')
    completeness -= 50
  }
  
  if (logicalLines <= 1 && returnLines === 1) {
    flags.push('minimal-body')
    completeness -= 30
  }
  
  if (body.match(/return\s+\{[^}]*\}\s*\/\/\s*(mock|stub|example|placeholder)/i)) {
    flags.push('mock-data-return')
    completeness -= 40
  }
  
  // Determine severity
  let severity: 'critical' | 'high' | 'medium' | 'low' | 'info' = 'info'
  if (completeness === 0) severity = 'critical'
  else if (completeness < 30) severity = 'high'
  else if (completeness < 60) severity = 'medium'
  else if (completeness < 80) severity = 'low'
  
  const summary = flags.length > 0 
    ? `Potential stub: ${flags.join(', ')}`
    : `Low implementation density (${completeness}%)`
  
  return {
    file: filePath,
    line: lineNumber,
    name,
    type,
    returnLines,
    jsxLines,
    logicalLines,
    completeness: Math.max(0, Math.min(100, completeness)),
    flags,
    severity,
    summary
  }
}

// Main execution
const analyses = analyzeImplementations()

const bySeverity = {
  critical: analyses.filter(a => a.severity === 'critical'),
  high: analyses.filter(a => a.severity === 'high'),
  medium: analyses.filter(a => a.severity === 'medium'),
  low: analyses.filter(a => a.severity === 'low')
}

const summary = {
  totalAnalyzed: analyses.length,
  bySeverity: {
    critical: bySeverity.critical.length,
    high: bySeverity.high.length,
    medium: bySeverity.medium.length,
    low: bySeverity.low.length
  },
  flagTypes: {
    'has-todo-comments': analyses.filter(a => a.flags.includes('has-todo-comments')).length,
    'throws-not-implemented': analyses.filter(a => a.flags.includes('throws-not-implemented')).length,
    'only-console-log': analyses.filter(a => a.flags.includes('only-console-log')).length,
    'returns-empty-value': analyses.filter(a => a.flags.includes('returns-empty-value')).length,
    'marked-as-mock': analyses.filter(a => a.flags.includes('marked-as-mock')).length,
    'component-no-jsx': analyses.filter(a => a.flags.includes('component-no-jsx')).length,
    'empty-fragment': analyses.filter(a => a.flags.includes('empty-fragment')).length,
    'minimal-body': analyses.filter(a => a.flags.includes('minimal-body')).length,
    'mock-data-return': analyses.filter(a => a.flags.includes('mock-data-return')).length
  },
  averageCompleteness: (analyses.reduce((sum, a) => sum + a.completeness, 0) / analyses.length).toFixed(1),
  criticalStubs: bySeverity.critical.map(a => ({
    file: a.file,
    line: a.line,
    name: a.name,
    type: a.type,
    flags: a.flags,
    summary: a.summary
  })),
  details: analyses.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  }).slice(0, 50), // Top 50 issues
  timestamp: new Date().toISOString()
}

const serialized = JSON.stringify(summary, null, 2)
const outputPath = process.argv[2] || 'implementation-analysis.json'

try {
  writeFileSync(outputPath, serialized)
  console.error(`Implementation analysis written to ${outputPath}`)
} catch (error) {
  console.error(`Failed to write implementation analysis to ${outputPath}:`, error)
}

console.log(serialized)
