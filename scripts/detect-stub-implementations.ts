#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

interface StubLocation {
  file: string
  line: number
  type: 'placeholder-return' | 'not-implemented' | 'empty-body' | 'todo-comment' | 'console-log-only' | 'placeholder-render' | 'mock-data' | 'stub-component'
  name: string
  severity: 'high' | 'medium' | 'low'
  code: string
}

const STUB_PATTERNS = [
  {
    name: 'Not implemented error',
    pattern: /throw\s+new\s+Error\s*\(\s*['"]not\s+implemented/i,
    type: 'not-implemented' as const,
    severity: 'high' as const,
    description: 'Function throws "not implemented"'
  },
  {
    name: 'TODO comment in function',
    pattern: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*XXX|\/\/\s*HACK/i,
    type: 'todo-comment' as const,
    severity: 'medium' as const,
    description: 'Function has TODO/FIXME comment'
  },
  {
    name: 'Console.log only',
    pattern: /function\s+\w+[^{]*{\s*console\.(log|debug)\s*\([^)]*\)\s*}|const\s+\w+\s*=\s*[^=>\s]*=>\s*console\.(log|debug)/,
    type: 'console-log-only' as const,
    severity: 'high' as const,
    description: 'Function only logs to console'
  },
  {
    name: 'Return null/undefined stub',
    pattern: /return\s+(null|undefined)|return\s*;(?=\s*})/,
    type: 'placeholder-return' as const,
    severity: 'low' as const,
    description: 'Function only returns null/undefined'
  },
  {
    name: 'Return mock data',
    pattern: /return\s+(\{[^}]*\}|\[[^\]]*\])\s*\/\/\s*(mock|stub|todo|placeholder|example)/i,
    type: 'mock-data' as const,
    severity: 'medium' as const,
    description: 'Function returns hardcoded mock data'
  },
  {
    name: 'Placeholder text in JSX',
    pattern: /<[A-Z]\w*[^>]*>\s*(placeholder|TODO|FIXME|stub|mock|example|not implemented)/i,
    type: 'placeholder-render' as const,
    severity: 'medium' as const,
    description: 'Component renders placeholder text'
  },
  {
    name: 'Empty component body',
    pattern: /export\s+(?:default\s+)?(?:function|const)\s+(\w+).*?\{[\s\n]*return\s+<[^>]+>\s*<\/[^>]+>\s*;?[\s\n]*\}/,
    type: 'stub-component' as const,
    severity: 'high' as const,
    description: 'Component has empty/minimal body'
  }
]

function findStubs(): StubLocation[] {
  const results: StubLocation[] = []
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
          scanFile(fullPath, results)
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  walkDir(srcDir)
  return results
}

function scanFile(filePath: string, results: StubLocation[]): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    // Find function/component boundaries
    const functionPattern = /(?:export\s+)?(?:async\s+)?(?:function|const)\s+(\w+)/g
    let match
    
    while ((match = functionPattern.exec(content)) !== null) {
      const functionName = match[1]
      const startIndex = match.index
      const lineNumber = content.substring(0, startIndex).split('\n').length
      
      // Extract function body
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
      
      const functionBody = content.substring(bodyStart, bodyEnd + 1)
      
      // Check against stub patterns
      checkPatterns(functionBody, filePath, lineNumber, functionName, results)
    }
    
    // Check for stub comments in file
    lines.forEach((line, idx) => {
      if (line.match(/stub|placeholder|mock|not implemented|TODO.*implementation/i)) {
        results.push({
          file: filePath,
          line: idx + 1,
          type: 'todo-comment',
          name: 'Stub indicator',
          severity: 'low',
          code: line.trim()
        })
      }
    })
  } catch (e) {
    // Skip files that can't be analyzed
  }
}

function checkPatterns(body: string, filePath: string, lineNumber: number, name: string, results: StubLocation[]): void {
  for (const pattern of STUB_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, 'i')
    if (regex.test(body)) {
      const bodyLineNum = body.split('\n')[0]?.length > 0 ? 
        lineNumber : lineNumber + 1
      
      results.push({
        file: filePath,
        line: bodyLineNum,
        type: pattern.type,
        name: name,
        severity: pattern.severity,
        code: body.split('\n').slice(0, 3).join('\n').substring(0, 80)
      })
    }
  }
}

// Main execution
const stubs = findStubs()

// Categorize by severity
const bySeverity = {
  high: stubs.filter(s => s.severity === 'high'),
  medium: stubs.filter(s => s.severity === 'medium'),
  low: stubs.filter(s => s.severity === 'low')
}

const summary = {
  totalStubsFound: stubs.length,
  bySeverity: {
    high: bySeverity.high.length,
    medium: bySeverity.medium.length,
    low: bySeverity.low.length
  },
  byType: {
    'not-implemented': stubs.filter(s => s.type === 'not-implemented').length,
    'todo-comment': stubs.filter(s => s.type === 'todo-comment').length,
    'console-log-only': stubs.filter(s => s.type === 'console-log-only').length,
    'placeholder-return': stubs.filter(s => s.type === 'placeholder-return').length,
    'mock-data': stubs.filter(s => s.type === 'mock-data').length,
    'placeholder-render': stubs.filter(s => s.type === 'placeholder-render').length,
    'stub-component': stubs.filter(s => s.type === 'stub-component').length,
    'empty-body': stubs.filter(s => s.type === 'empty-body').length
  },
  criticalIssues: bySeverity.high.map(s => ({
    file: s.file,
    line: s.line,
    function: s.name,
    type: s.type
  })),
  details: stubs.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  }),
  timestamp: new Date().toISOString()
}

console.log(JSON.stringify(summary, null, 2))
